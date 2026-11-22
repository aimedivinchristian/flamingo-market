import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: params.id },
      include: { seller: { select: { id: true, name: true, image: true, createdAt: true } }, products: { where: { isActive: true }, include: { category: true, seller: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }, _count: { select: { products: true } } },
    });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    const totalOrders = await prisma.orderItem.count({ where: { product: { storeId: store.id } } });
    return NextResponse.json({ ...store, totalOrders });
  } catch (err) { console.error("[GET_STORE]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (store.sellerId !== session.user.id && session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { name, description, logo, banner, isVerified } = await req.json();
    const updated = await prisma.store.update({ where: { id: params.id }, data: { ...(name && { name }), ...(description !== undefined && { description }), ...(logo !== undefined && { logo }), ...(banner !== undefined && { banner }), ...(isVerified !== undefined && session.user.role === "ADMIN" && { isVerified }) } });
    return NextResponse.json(updated);
  } catch (err) { console.error("[PATCH_STORE]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
