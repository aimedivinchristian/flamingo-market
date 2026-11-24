import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
const INCLUDE = { seller: { select: { name: true } }, store: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } } as const;

/** Personalised picks: categories the visitor recently viewed first (boosted + popular), topped up with trending products. */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const clean = (v: string | null) => (v || "").split(",").map(x => x.trim()).filter(x => /^[a-z0-9]{10,40}$/i.test(x)).slice(0, 20);
    const cats = clean(sp.get("cats")), exclude = clean(sp.get("exclude"));
    const limit = Math.min(12, Math.max(1, Number(sp.get("limit")) || 8));
    const base = { isActive: true, stock: { gt: 0 }, id: { notIn: exclude } };
    const order = [{ boostUntil: { sort: "desc", nulls: "last" } }, { views: "desc" }, { createdAt: "desc" }] as any;

    let picks: any[] = [];
    if (cats.length) picks = await prisma.product.findMany({ where: { ...base, categoryId: { in: cats } }, orderBy: order, take: limit, include: INCLUDE });
    if (picks.length < limit) {
      const rest = await prisma.product.findMany({ where: { ...base, id: { notIn: [...exclude, ...picks.map(p => p.id)] } }, orderBy: [{ views: "desc" }, { createdAt: "desc" }], take: limit - picks.length, include: INCLUDE });
      picks = picks.concat(rest);
    }
    return NextResponse.json({ personalised: cats.length > 0, products: picks }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) { console.error("[RECOMMENDATIONS]", err); return NextResponse.json({ products: [] }, { status: 200 }); }
}
