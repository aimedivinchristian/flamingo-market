import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import prisma                        from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Sellers only" }, { status: 401 });
    }
    const { name, description } = await req.json();
    const existing = await prisma.store.findUnique({ where: { sellerId: session.user.id } });
    if (existing) return NextResponse.json({ error: "Store already exists" }, { status: 409 });

    const store = await prisma.store.create({
      data: { name, description, sellerId: session.user.id },
    });
    return NextResponse.json(store, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        seller:   { select: { name: true, email: true } },
        products: { where: { isActive: true }, select: { id: true } },
        _count:   { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stores);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
