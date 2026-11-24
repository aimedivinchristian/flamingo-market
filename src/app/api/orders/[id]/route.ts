import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pushToUsers, pushToAdmins } from "@/lib/push";
import { sendOrderStatusEmail } from "@/lib/notifications";
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { buyer: { select: { id: true, name: true, email: true, image: true } }, items: { include: { product: { select: { id: true, name: true, images: true, price: true, sellerId: true, store: { select: { id: true, name: true } } } } } }, statusHistory: { orderBy: { createdAt: "asc" } } } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isBuyer = order.buyerId === session.user.id; const isSeller = order.items.some(i => i.product.sellerId === session.user.id); const isAdmin = session.user.role === "ADMIN";
    if (!isBuyer && !isSeller && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json(order);
  } catch (err) { console.error("[GET_ORDER]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role === "BUYER") {
      const order = await prisma.order.findUnique({ where: { id: params.id } });
      if (!order || order.buyerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (order.status !== "PENDING") return NextResponse.json({ error: "Can only cancel pending orders" }, { status: 400 });
      const updated = await prisma.order.update({ where: { id: params.id }, data: { status: "CANCELLED" } });
      await prisma.orderStatusHistory.create({ data: { orderId: params.id, status: "CANCELLED", note: "Cancelled by buyer", createdBy: session.user.id } });
      const items = await prisma.orderItem.findMany({ where: { orderId: params.id } });
      await Promise.all(items.map(i => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })));
      return NextResponse.json(updated);
    }
    const { status, note } = await req.json();
    const VALID = ["PENDING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"];
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    if (session.user.role === "SELLER") {
      const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: { include: { product: true } } } });
      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (!order.items.some(i => i.product.sellerId === session.user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.order.update({ where: { id: params.id }, data: { status }, include: { buyer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } } });
    await prisma.orderStatusHistory.create({ data: { orderId: params.id, status, note: note?.trim() || null, createdBy: session.user.id } });
    await sendOrderStatusEmail({ id: updated.id, buyer: updated.buyer }, status, note?.trim() || null);
    await pushToUsers([updated.buyerId], { title: `Order ${String(status).toLowerCase()}`, body: note?.trim() || `Your order #${updated.id.slice(-6).toUpperCase()} is now ${String(status).toLowerCase()}`, url: `/order/${updated.id}` });
    if (status === "CANCELLED") { const items = await prisma.orderItem.findMany({ where: { orderId: params.id } }); await Promise.all(items.map(i => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } }))); }
    return NextResponse.json(updated);
  } catch (err) { console.error("[PATCH_ORDER]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
