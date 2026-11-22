import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import prisma                        from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        seller:   { select: { id: true, name: true, image: true } },
        store:    { select: { id: true, name: true, logo: true, isVerified: true } },
        orderItems: { select: { quantity: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.user.role !== "ADMIN" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const isAdmin = session.user.role === "ADMIN";
    const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v));
    const price = num(data.price), stock = num(data.stock);
    if (price !== undefined && (!isFinite(price) || price <= 0)) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
    const oldPrice = data.oldPrice === undefined ? undefined : (data.oldPrice === null || data.oldPrice === "" ? null : Number(data.oldPrice));
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name:        typeof data.name === "string" ? data.name.trim() : undefined,
        description: typeof data.description === "string" ? data.description.trim() : undefined,
        price,
        oldPrice,
        stock,
        images:      Array.isArray(data.images) ? data.images : undefined,
        isActive:    typeof data.isActive === "boolean" ? data.isActive : undefined,
        // only admins may feature products
        isFeatured:  isAdmin && typeof data.isFeatured === "boolean" ? data.isFeatured : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.user.role !== "ADMIN" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Products that were ordered can't be hard-deleted (order history); hide them instead.
    const ordered = await prisma.orderItem.count({ where: { productId: params.id } });
    if (ordered > 0) {
      await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
      return NextResponse.json({ success: true, archived: true });
    }
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
