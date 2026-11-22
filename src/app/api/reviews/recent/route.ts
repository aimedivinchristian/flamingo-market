import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* Public — most recent 5-star reviews across the platform, for homepage testimonials */
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
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("[GET_RECENT_REVIEWS]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
