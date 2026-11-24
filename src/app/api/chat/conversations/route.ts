import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// List my conversations
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = session.user.id;
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: me }, { sellerId: me }] },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: { buyer: { select: { id: true, name: true, image: true } }, seller: { select: { id: true, name: true, image: true, store: { select: { name: true, logo: true } } } } },
  });
  return NextResponse.json(convs.map(c => {
    const iAmBuyer = c.buyerId === me;
    const other = iAmBuyer ? c.seller : c.buyer;
    const otherName = iAmBuyer ? (c.seller.store?.name || c.seller.name) : c.buyer.name;
    return { id: c.id, otherName, otherImage: iAmBuyer ? (c.seller.store?.logo || other.image) : other.image, lastMessage: c.lastMessage, lastMessageAt: c.lastMessageAt, unread: iAmBuyer ? c.buyerUnread : c.sellerUnread };
  }));
}

// Start (or reuse) a conversation with a seller
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Please sign in to chat" }, { status: 401 });
  const { sellerId, productId } = await req.json();
  if (!sellerId || typeof sellerId !== "string") return NextResponse.json({ error: "sellerId required" }, { status: 400 });
  if (sellerId === session.user.id) return NextResponse.json({ error: "You can't message yourself" }, { status: 400 });
  const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { id: true, role: true } });
  if (!seller || seller.role !== "SELLER") return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  const conv = await prisma.conversation.upsert({
    where: { buyerId_sellerId: { buyerId: session.user.id, sellerId } },
    update: productId ? { productId } : {},
    create: { buyerId: session.user.id, sellerId, productId: productId || null },
  });
  return NextResponse.json({ id: conv.id });
}
