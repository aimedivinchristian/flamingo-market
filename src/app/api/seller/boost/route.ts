import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BOOST_OPTIONS, BOOST_PRICE_PER_DAY } from "@/lib/boost";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.boostRequest.findMany({ where: { sellerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { product: { select: { name: true, boostUntil: true } } } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { productId, days } = await req.json();
    if (!BOOST_OPTIONS.includes(Number(days))) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id: String(productId) } });
    if (!product || product.sellerId !== session.user.id) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const pending = await prisma.boostRequest.findFirst({ where: { productId: product.id, status: "PENDING" } });
    if (pending) return NextResponse.json({ error: "This product already has a pending boost request" }, { status: 409 });
    const boost = await prisma.boostRequest.create({ data: { productId: product.id, sellerId: session.user.id, days: Number(days), amount: Number(days) * BOOST_PRICE_PER_DAY } });
    if (process.env.ADMIN_EMAIL) sendEmail({ to: process.env.ADMIN_EMAIL, subject: "New boost request", html: `<p>${escapeHtml(session.user.name || "A seller")} requested a <b>${boost.days}-day boost</b> for "${escapeHtml(product.name)}" — RWF ${boost.amount.toLocaleString()}. Reference: <b>${boost.id.slice(-6).toUpperCase()}</b>.</p><p><a href="${process.env.NEXTAUTH_URL}/admin/boosts">Review requests</a></p>` }).catch(() => {});
    return NextResponse.json(boost);
  } catch (err) { console.error("[BOOST]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
