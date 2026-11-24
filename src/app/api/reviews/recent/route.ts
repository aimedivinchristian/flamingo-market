import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* Public — most recent 5-star reviews across the platform, for homepage testimonials */
export const dynamic = "force-dynamic"; // never freeze at build time

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: {
        buyer: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return NextResponse.json(reviews, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) {
    console.error("[GET_RECENT_REVIEWS]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
