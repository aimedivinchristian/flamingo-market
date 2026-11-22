import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [totalUsers, totalSellers, totalBuyers, totalProducts, orders] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const monthlyRevenue = orders.reduce((acc: Record<string, number>, o) => {
      const month = new Date(o.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      acc[month] = (acc[month] || 0) + o.total;
      return acc;
    }, {});
    return NextResponse.json({
      totalUsers, totalSellers, totalBuyers, totalProducts,
      totalOrders: orders.length, totalRevenue, pendingOrders,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
