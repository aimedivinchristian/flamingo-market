import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sellerId = session.user.id;
  const [products, items] = await Promise.all([
    prisma.product.findMany({ where: { sellerId }, select: { id: true, name: true, images: true, views: true, stock: true, isActive: true, boostUntil: true } }),
    prisma.orderItem.findMany({ where: { product: { sellerId }, order: { status: { not: "CANCELLED" } } }, select: { productId: true, quantity: true, price: true, orderId: true, order: { select: { createdAt: true } } } }),
  ]);
  const stats: Record<string, { orders: Set<string>; units: number; revenue: number }> = {};
  for (const i of items) { const s = (stats[i.productId] ||= { orders: new Set(), units: 0, revenue: 0 }); s.orders.add(i.orderId); s.units += i.quantity; s.revenue += i.price * i.quantity; }
  const rows = products.map(p => {
    const s = stats[p.id];
    const orders = s ? s.orders.size : 0;
    return { id: p.id, name: p.name, image: p.images[0] ?? null, views: p.views, orders, units: s?.units ?? 0, revenue: s?.revenue ?? 0, conversion: p.views > 0 ? Math.round((orders / p.views) * 1000) / 10 : 0, stock: p.stock, isActive: p.isActive, boosted: !!p.boostUntil && p.boostUntil > new Date() };
  }).sort((a, b) => b.revenue - a.revenue || b.views - a.views);

  const since = Date.now() - 13 * 86400_000;
  const perDay: Record<string, number> = {};
  for (const i of items) { if (i.order.createdAt.getTime() >= since) { const k = i.order.createdAt.toISOString().slice(0, 10); perDay[k] = (perDay[k] || 0) + i.price * i.quantity; } }
  const daily = Array.from({ length: 14 }, (_, n) => { const d = new Date(Date.now() - (13 - n) * 86400_000); const k = d.toISOString().slice(0, 10); return { date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: perDay[k] || 0 }; });

  const totalViews = rows.reduce((a, r) => a + r.views, 0);
  const totalOrders = new Set(items.map(i => i.orderId)).size;
  return NextResponse.json({
    totals: { views: totalViews, orders: totalOrders, units: rows.reduce((a, r) => a + r.units, 0), revenue: rows.reduce((a, r) => a + r.revenue, 0), conversion: totalViews > 0 ? Math.round((totalOrders / totalViews) * 1000) / 10 : 0 },
    daily, products: rows,
  });
}
