import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
    const reviews = await prisma.review.findMany({ where: { productId }, include: { buyer: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } });
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const dist = [5,4,3,2,1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length, pct: total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0 }));
    return NextResponse.json({ reviews, total, avg: Math.round(avg * 10) / 10, dist });
  } catch (err) { console.error("[GET_REVIEWS]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "BUYER") return NextResponse.json({ error: "Buyers only" }, { status: 401 });
    const { productId, orderId, rating, title, body } = await req.json();
    if (!productId || !orderId || !rating || !body?.trim()) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId, productId, order: { buyerId: session.user.id, status: "DELIVERED" } } });
    if (!orderItem) return NextResponse.json({ error: "You can only review products from delivered orders" }, { status: 403 });
    const existing = await prisma.review.findUnique({ where: { productId_buyerId: { productId, buyerId: session.user.id } } });
    if (existing) return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });
    const review = await prisma.review.create({ data: { productId, buyerId: session.user.id, orderId, rating: parseInt(String(rating)), title: title?.trim() || null, body: body.trim() }, include: { buyer: { select: { id: true, name: true, image: true } } } });
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) { console.error("[CREATE_REVIEW]", err); if (err.code === "P2002") return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 }); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
