import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [pendingOrders, recentOrders] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({ where: { status: "PENDING" }, take: 5, orderBy: { createdAt: "desc" }, include: { buyer: { select: { name: true } }, items: { select: { quantity: true, price: true } } } }),
    ]);
    return NextResponse.json({ pendingOrders, recentOrders });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
