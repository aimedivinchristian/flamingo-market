import { NextResponse } from "next/server";
import prisma           from "@/lib/prisma";

export const dynamic = "force-dynamic"; // never freeze at build time

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(cats, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1500" } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
