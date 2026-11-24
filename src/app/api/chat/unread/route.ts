import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ unread: 0 });
  const me = session.user.id;
  const [a, b] = await Promise.all([
    prisma.conversation.aggregate({ where: { buyerId: me }, _sum: { buyerUnread: true } }),
    prisma.conversation.aggregate({ where: { sellerId: me }, _sum: { sellerUnread: true } }),
  ]);
  return NextResponse.json({ unread: (a._sum.buyerUnread || 0) + (b._sum.sellerUnread || 0) });
}
