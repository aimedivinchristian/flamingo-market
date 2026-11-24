import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sellerId = searchParams.get("sellerId");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await prisma.product.updateMany({ where: { boostUntil: { lt: new Date() } }, data: { boostUntil: null } }).catch(() => {});
    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (sellerId) where.sellerId = sellerId;
    if (featured === "true") where.isFeatured = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: { select: { id: true, name: true, image: true } },
          store: { select: { id: true, name: true, logo: true } },
        },
        orderBy: [{ boostUntil: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET_PRODUCTS]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, price, oldPrice, stock, images, categoryId } = data;

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
    });

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        stock: parseInt(stock) || 0,
        images: images || [],
        sellerId: session.user.id,
        categoryId,
        storeId: store?.id,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PRODUCT]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
