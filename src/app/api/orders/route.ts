import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendOrderNotification, sendBuyerConfirmation, sendLowStockAlert } from "@/lib/notifications";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { pushToAdmins, pushToUsers } from "@/lib/push";
import { evaluatePromo } from "@/lib/promo";
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let where: any = {};
    if (session.user.role === "BUYER") where.buyerId = session.user.id;
    else if (session.user.role === "SELLER") where.items = { some: { product: { sellerId: session.user.id } } };
    const orders = await prisma.order.findMany({ where, include: { buyer: { select: { id: true, name: true, email: true, image: true } }, items: { include: { product: { select: { id: true, name: true, images: true, sellerId: true } } } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(orders);
  } catch (err) { console.error("[GET_ORDERS]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const rl = await rateLimit(`order:${session.user.id}`, 10, 10 * 60);
    if (!rl.ok) return tooMany(rl.retryAfter);

    const body = await req.json();
    const address = String(body.address || "").trim().slice(0, 300);
    const phone = String(body.phone || "").trim().slice(0, 30);
    const notes = body.notes ? String(body.notes).trim().slice(0, 500) : null;
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50 || !address || !phone) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // merge duplicate lines + validate quantities (never trust the browser)
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
      if (p.stock < q) return NextResponse.json({ error: `Not enough stock for: ${p.name}` }, { status: 400 });
      total += p.price * q; orderItems.push({ productId: p.id, quantity: q, price: p.price });
    }

    // Discount is recomputed on the server from the promo code — the browser-sent amount is ignored
    let promoId: string | null = null, discountAmount = 0;
    if (body.promoId) {
      const r = await evaluatePromo({ id: String(body.promoId) }, session.user.id, total);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
      promoId = r.promoId; discountAmount = r.discount;
    }
    const finalTotal = Math.max(0, total - discountAmount);

    // Atomic: reserve stock (fails if someone else bought the last items), create order, record promo use
    let order;
    try {
      order = await prisma.$transaction(async tx => {
        for (const it of orderItems) {
          const r = await tx.product.updateMany({ where: { id: it.productId, isActive: true, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } });
          if (r.count === 0) throw new Error("OUT_OF_STOCK");
        }
        const o = await tx.order.create({
          // Cash on delivery only: online payments create their own orders (MoMo / Stripe) and are confirmed by the payment provider
          data: { buyerId: session.user.id, total: finalTotal, address, phone, notes, status: "PENDING", items: { create: orderItems } },
          include: { buyer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
        });
        await tx.orderStatusHistory.create({ data: { orderId: o.id, status: o.status, note: "Order placed", createdBy: session.user.id } });
        if (promoId) {
          await tx.promoUsage.create({ data: { promoId, userId: session.user.id, orderId: o.id } }); // unique (promo,user) blocks reuse
          await tx.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } });
        }
        return o;
      });
    } catch (e: any) {
      if (e?.message === "OUT_OF_STOCK") return NextResponse.json({ error: "Sorry, an item just sold out. Please review your cart." }, { status: 409 });
      if (e?.code === "P2002") return NextResponse.json({ error: "You have already used this promo code" }, { status: 400 });
      throw e;
    }

    // Notifications (awaited so serverless doesn't freeze them mid-send)
    const sellerRows: { sellerId: string }[] = await prisma.product.findMany({ where: { id: { in: orderItems.map(i => i.productId) } }, select: { sellerId: true } });
    const sellerIds: string[] = Array.from(new Set<string>(sellerRows.map(p => p.sellerId)));
    await Promise.allSettled([
      sendOrderNotification(order as any), sendBuyerConfirmation(order as any),
      pushToAdmins({ title: "New order 🛍️", body: `RWF ${finalTotal.toLocaleString()} from ${order.buyer.name}`, url: "/admin" }),
      pushToUsers(sellerIds, { title: "New order 🛍️", body: "You have a new order to process", url: "/seller/orders" }),
      sendLowStockAlert(orderItems.map(i => i.productId)),
    ]);
    return NextResponse.json(order, { status: 201 });
  } catch (err) { console.error("[CREATE_ORDER]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
