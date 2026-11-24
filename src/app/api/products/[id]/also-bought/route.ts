import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** "Customers also bought": products that appear in the same (non-cancelled) orders as this one. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const orders = await prisma.orderItem.findMany({ where: { productId: params.id, order: { status: { not: "CANCELLED" } } }, select: { orderId: true }, take: 200, orderBy: { id: "desc" } });
    if (!orders.length) return NextResponse.json({ products: [] });
    const groups = await prisma.orderItem.groupBy({ by: ["productId"], where: { orderId: { in: orders.map(o => o.orderId) }, productId: { not: params.id } }, _count: { productId: true }, orderBy: { _count: { productId: "desc" } }, take: 8 });
    const products = await prisma.product.findMany({ where: { id: { in: groups.map((g: { productId: string }) => g.productId) }, isActive: true, stock: { gt: 0 } }, include: { seller: { select: { name: true } }, store: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } } });
    const rank = new Map<string, number>(groups.map((g: { productId: string }, i: number) => [g.productId, i] as [string, number]));
    products.sort((a: { id: string }, b: { id: string }) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
    return NextResponse.json({ products: products.slice(0, 4) }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } });
  } catch (err) { console.error("[ALSO_BOUGHT]", err); return NextResponse.json({ products: [] }); }
}
