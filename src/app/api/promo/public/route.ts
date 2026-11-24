import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* Public — only genuinely live promo codes: active, not expired, not exhausted */
export const dynamic = "force-dynamic"; // never freeze at build time

export async function GET() {
  try {
    const codes = await prisma.promoCode.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { code: true, type: true, value: true, minOrder: true, maxUses: true, usedCount: true },
      orderBy: { createdAt: "desc" },
    });
    const live = codes.filter(c => c.maxUses === null || c.usedCount < c.maxUses);
    return NextResponse.json(live.map(({ code, type, value, minOrder }) => ({ code, type, value, minOrder })), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) {
    console.error("[GET_PUBLIC_PROMO]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
