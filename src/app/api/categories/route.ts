import { NextResponse } from "next/server";
import prisma           from "@/lib/prisma";

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(cats);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
