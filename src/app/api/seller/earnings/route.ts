import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SELLER","ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sellerId = session.user.id;
    const items = await prisma.orderItem.findMany({ where: { product: { sellerId }, order: { status: { not: "CANCELLED" } } }, include: { order: { select: { id: true, status: true, createdAt: true } }, product: { select: { id: true, name: true, images: true, category: { select: { name: true } } } } }, orderBy: { order: { createdAt: "desc" } } });
    const totalRevenue = items.filter(i => i.order.status === "DELIVERED").reduce((s, i) => s + i.price * i.quantity, 0);
    const pendingRevenue = items.filter(i => ["CONFIRMED","SHIPPED"].includes(i.order.status)).reduce((s, i) => s + i.price * i.quantity, 0);
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = items.filter(i => new Date(i.order.createdAt) >= monthStart && i.order.status !== "CANCELLED").reduce((s, i) => s + i.price * i.quantity, 0);
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonth = items.filter(i => { const d = new Date(i.order.createdAt); return d >= lastStart && d <= lastEnd && i.order.status !== "CANCELLED"; }).reduce((s, i) => s + i.price * i.quantity, 0);
    const daily: Record<string, number> = {}; const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);
    items.filter(i => new Date(i.order.createdAt) >= thirtyDaysAgo && i.order.status !== "CANCELLED").forEach(i => { const day = new Date(i.order.createdAt).toISOString().slice(0, 10); daily[day] = (daily[day] || 0) + i.price * i.quantity; });
    const dailyChart = Array.from({ length: 30 }, (_, idx) => { const d = new Date(Date.now() - (29 - idx) * 86400_000); const key = d.toISOString().slice(0, 10); return { date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: daily[key] || 0 }; });
    const byProduct: Record<string, { name: string; image: string; category: string; revenue: number; units: number }> = {};
    items.filter(i => i.order.status !== "CANCELLED").forEach(i => { const key = i.product.id; if (!byProduct[key]) byProduct[key] = { name: i.product.name, image: i.product.images?.[0] ?? "", category: i.product.category.name, revenue: 0, units: 0 }; byProduct[key].revenue += i.price * i.quantity; byProduct[key].units += i.quantity; });
    const topProducts = Object.entries(byProduct).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const withdrawals = await prisma.withdrawal.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" }, take: 10 });
    const commission = 0.10; const netRevenue = totalRevenue * (1 - commission);
    const withdrawn = withdrawals.filter(w => w.status === "PAID").reduce((s, w) => s + w.amount, 0);
    const availableBalance = netRevenue - withdrawn;
    return NextResponse.json({ totalRevenue, netRevenue, pendingRevenue, thisMonth, lastMonth, availableBalance, withdrawn, commission, dailyChart, topProducts, withdrawals, totalOrders: new Set(items.map(i => i.order.id)).size, totalUnits: items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) { console.error("[SELLER_EARNINGS]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
