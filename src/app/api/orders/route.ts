import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendOrderNotification, sendBuyerConfirmation } from "@/lib/notifications";
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
    const { items, address, phone, notes, paymentMethod, promoId, discount } = await req.json();
    if (!items?.length || !address?.trim() || !phone?.trim()) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    let total = 0; const orderItems: { productId: string; quantity: number; price: number }[] = [];
    for (const item of items as { productId: string; quantity: number }[]) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Not enough stock for: ${product.name}` }, { status: 400 });
      total += product.price * item.quantity; orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }
    const discountAmount = (discount && promoId) ? Math.min(parseFloat(String(discount)), total) : 0;
    const finalTotal = Math.max(0, total - discountAmount);
    const order = await prisma.order.create({ data: { buyerId: session.user.id, total: finalTotal, address: address.trim(), phone: phone.trim(), notes: notes?.trim() || null, status: paymentMethod === "cod" ? "PENDING" : "CONFIRMED", items: { create: orderItems } }, include: { buyer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } } });
    await prisma.orderStatusHistory.create({ data: { orderId: order.id, status: order.status, note: "Order placed", createdBy: session.user.id } });
    if (promoId) { try { await prisma.promoUsage.create({ data: { promoId, userId: session.user.id, orderId: order.id } }); await prisma.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } }); } catch {} }
    await Promise.all(orderItems.map(item => prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })));
    sendOrderNotification(order as any).catch(console.error);
    sendBuyerConfirmation(order as any).catch(console.error);
    return NextResponse.json(order, { status: 201 });
  } catch (err) { console.error("[CREATE_ORDER]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
