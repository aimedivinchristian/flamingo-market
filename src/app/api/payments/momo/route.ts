/**
 * MTN Mobile Money Integration
 * Uses the MTN MoMo API (sandbox → production)
 * Docs: https://momodeveloper.mtn.com
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import prisma                        from "@/lib/prisma";
import { rateLimit, tooMany }        from "@/lib/rate-limit";
import { pushToAdmins, pushToUsers } from "@/lib/push";
import { sendLowStockAlert }         from "@/lib/notifications";
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
    // Each call sends a payment prompt to a phone — limit it so it can't be used to spam people
    const rl = await rateLimit(`momo:${session.user.id}`, 5, 10 * 60);
    if (!rl.ok) return tooMany(rl.retryAfter);

    const body = await req.json();
    const address = String(body.address || "").trim().slice(0, 300);
    const phone = String(body.phone || "").trim().replace(/\s+/g, "").slice(0, 20);
    const notes = body.notes ? String(body.notes).trim().slice(0, 500) : null;
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50 || !address || !/^\+?\d{9,15}$/.test(phone)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }
    const qty = new Map<string, number>();
    for (const it of body.items) {
      const q = Number(it?.quantity);
      if (typeof it?.productId !== "string" || !Number.isInteger(q) || q < 1 || q > 100) return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      qty.set(it.productId, (qty.get(it.productId) || 0) + q);
    }
    const products = await prisma.product.findMany({ where: { id: { in: Array.from(qty.keys()) } } });
    if (products.length !== qty.size) return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    let total = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    for (const p of products) {
      const q = qty.get(p.id)!;
      if (!p.isActive) return NextResponse.json({ error: `Product unavailable: ${p.name}` }, { status: 400 });
      if (p.stock < q) return NextResponse.json({ error: `Not enough stock: ${p.name}` }, { status: 400 });
      total += p.price * q; orderItems.push({ productId: p.id, quantity: q, price: p.price });
    }

    const referenceId = uuid();
    // PENDING order, tied to this payment reference (so only this payment can confirm it)
    const order = await prisma.order.create({
      data: { buyerId: session.user.id, total, address, phone, notes, status: "PENDING", paymentRef: referenceId, items: { create: orderItems } },
    });

    try {
      const token = await getMoMoToken();
      await requestToPay(token, referenceId, total, phone, `Order #${order.id.slice(-6)}`);
    } catch (e) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }).catch(() => {});
      throw e;
    }
    return NextResponse.json({ success: true, orderId: order.id, referenceId, message: "Payment request sent to your phone. Please approve the prompt." });
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
    const referenceId = searchParams.get("ref");
    const orderId = searchParams.get("orderId");
    if (!referenceId || !orderId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    // The order must be MINE and be the one this exact payment reference was created for
    const existing = await prisma.order.findFirst({ where: { id: orderId, buyerId: session.user.id, paymentRef: referenceId } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (existing.status !== "PENDING") return NextResponse.json({ status: existing.status === "CANCELLED" ? "FAILED" : "SUCCESSFUL" }); // already settled — no side effects twice

    const token = await getMoMoToken();
    const status = await checkPaymentStatus(token, referenceId);

    if (status.status === "SUCCESSFUL") {
      // Only the request that flips PENDING -> CONFIRMED does the follow-up work (idempotent under repeated polling)
      const flipped = await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CONFIRMED" } });
      if (flipped.count === 1) {
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { buyer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true, sellerId: true } } } } } });
        if (order) {
          for (const item of order.items) {
            await prisma.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
          }
          await prisma.orderStatusHistory.create({ data: { orderId, status: "CONFIRMED", note: "Paid with MTN MoMo", createdBy: session.user.id } }).catch(() => {});
          await Promise.allSettled([
            sendOrderNotification(order as any),
            pushToAdmins({ title: "New paid order 💰", body: `RWF ${order.total.toLocaleString()} via MoMo`, url: "/admin" }),
            pushToUsers(Array.from(new Set(order.items.map(i => i.product.sellerId))), { title: "New order 🛍️", body: "A paid order is waiting for you", url: "/seller/orders" }),
            sendLowStockAlert(order.items.map(i => i.productId)),
          ]);
        }
      }
      return NextResponse.json({ status: "SUCCESSFUL", order: { id: orderId } });
    }

    if (status.status === "FAILED") {
      await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
    }
    return NextResponse.json({ status: status.status });
  } catch (err) {
    console.error("[MOMO_STATUS]", err);
    return NextResponse.json({ error: "Status check failed" }, { status: 500 });
  }
}
