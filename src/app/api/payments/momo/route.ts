/**
 * MTN Mobile Money Integration
 * Uses the MTN MoMo API (sandbox → production)
 * Docs: https://momodeveloper.mtn.com
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import prisma                        from "@/lib/prisma";
import { sendOrderNotification }     from "@/lib/notifications";
import { v4 as uuid }                from "uuid";

const MOMO_BASE = process.env.MOMO_ENV === "production"
  ? "https://proxy.momoapi.mtn.com"
  : "https://sandbox.momodeveloper.mtn.com";

const MOMO_HEADERS = {
  "Content-Type":    "application/json",
  "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY!,
};

// Step 1 – get access token
async function getMoMoToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`
  ).toString("base64");

  const res = await fetch(`${MOMO_BASE}/collection/token/`, {
    method:  "POST",
    headers: { ...MOMO_HEADERS, Authorization: `Basic ${creds}` },
  });

  if (!res.ok) throw new Error("MoMo token fetch failed");
  const data = await res.json();
  return data.access_token as string;
}

// Step 2 – request to pay
async function requestToPay(
  token:       string,
  referenceId: string,
  amount:      number,
  phone:       string,
  note:        string
) {
  const res = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay`, {
    method:  "POST",
    headers: {
      ...MOMO_HEADERS,
      Authorization:             `Bearer ${token}`,
      "X-Reference-Id":          referenceId,
      "X-Target-Environment":    process.env.MOMO_ENV === "production" ? "mtnrwanda" : "sandbox",
    },
    body: JSON.stringify({
      amount:       String(Math.round(amount)),
      currency:     "RWF",
      externalId:   referenceId,
      payer: {
        partyIdType: "MSISDN",
        partyId:      phone.replace(/\D/g, ""), // digits only
      },
      payerMessage: note || "Flamingo Market Order",
      payeeNote:    "Payment for Flamingo Market",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MoMo request failed: ${err}`);
  }
}

// Step 3 – poll status
async function checkPaymentStatus(token: string, referenceId: string) {
  const res = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      ...MOMO_HEADERS,
      Authorization:          `Bearer ${token}`,
      "X-Target-Environment": process.env.MOMO_ENV === "production" ? "mtnrwanda" : "sandbox",
    },
  });
  return res.json();
}

/* ─── POST /api/payments/momo ─── initiate payment ─── */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { items, address, phone, notes } = await req.json();

    if (!items?.length || !address || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate & total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product unavailable` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock: ${product.name}` }, { status: 400 });
      }
      total += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }

    const referenceId = uuid();

    // Create PENDING order first
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        total, address, phone,
        notes:  notes ?? null,
        status: "PENDING",
        items:  { create: orderItems },
      },
      include: {
        buyer: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // Initiate MoMo payment
    const token = await getMoMoToken();
    await requestToPay(token, referenceId, total, phone, `Order #${order.id.slice(-6)}`);

    return NextResponse.json({
      success:     true,
      orderId:     order.id,
      referenceId,
      message:     "Payment request sent to your phone. Please approve the prompt.",
    });
  } catch (err) {
    console.error("[MOMO_INITIATE]", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}

/* ─── GET /api/payments/momo?ref=…&orderId=… ─── poll status ─── */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const referenceId      = searchParams.get("ref");
    const orderId          = searchParams.get("orderId");

    if (!referenceId || !orderId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const token  = await getMoMoToken();
    const status = await checkPaymentStatus(token, referenceId);

    if (status.status === "SUCCESSFUL") {
      // Update order to CONFIRMED
      const order = await prisma.order.update({
        where: { id: orderId },
        data:  { status: "CONFIRMED" },
        include: {
          buyer: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });

      // Decrease stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      // Notify admin
      await sendOrderNotification(order as any);

      return NextResponse.json({ status: "SUCCESSFUL", order });
    }

    if (status.status === "FAILED") {
      await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    }

    return NextResponse.json({ status: status.status });
  } catch (err) {
    console.error("[MOMO_STATUS]", err);
    return NextResponse.json({ error: "Status check failed" }, { status: 500 });
  }
}
