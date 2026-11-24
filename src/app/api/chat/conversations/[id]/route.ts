import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, escapeHtml } from "@/lib/email";

async function loadConv(id: string, me: string) {
  const c = await prisma.conversation.findUnique({ where: { id }, include: { buyer: { select: { id: true, name: true, email: true } }, seller: { select: { id: true, name: true, email: true, store: { select: { name: true } } } } } });
  if (!c || (c.buyerId !== me && c.sellerId !== me)) return null;
  return c;
}

// Messages (and mark my side as read)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = session.user.id;
  const c = await loadConv(params.id, me);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const iAmBuyer = c.buyerId === me;
  const [messages] = await Promise.all([
    prisma.message.findMany({ where: { conversationId: c.id }, orderBy: { createdAt: "asc" }, take: 300, select: { id: true, senderId: true, body: true, createdAt: true } }),
    (iAmBuyer ? c.buyerUnread : c.sellerUnread) > 0
      ? prisma.conversation.update({ where: { id: c.id }, data: iAmBuyer ? { buyerUnread: 0 } : { sellerUnread: 0 } })
      : Promise.resolve(null),
  ]);
  return NextResponse.json({ id: c.id, me, otherName: iAmBuyer ? (c.seller.store?.name || c.seller.name) : c.buyer.name, messages });
}

// Send a message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = session.user.id;
    const c = await loadConv(params.id, me);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { body } = await req.json();
    const text = String(body || "").trim().slice(0, 2000);
    if (!text) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    const recent = await prisma.message.count({ where: { senderId: me, createdAt: { gt: new Date(Date.now() - 60_000) } } });
    if (recent >= 20) return NextResponse.json({ error: "You're sending messages too fast. Wait a moment." }, { status: 429 });

    const iAmBuyer = c.buyerId === me;
    const otherUnreadBefore = iAmBuyer ? c.sellerUnread : c.buyerUnread;
    const msg = await prisma.message.create({ data: { conversationId: c.id, senderId: me, body: text }, select: { id: true, senderId: true, body: true, createdAt: true } });
    await prisma.conversation.update({ where: { id: c.id }, data: { lastMessage: text.slice(0, 120), lastMessageAt: new Date(), ...(iAmBuyer ? { sellerUnread: { increment: 1 } } : { buyerUnread: { increment: 1 } }) } });

    // Email the other person only when this is the first unread message (avoids spam)
    if (otherUnreadBefore === 0 && process.env.RESEND_API_KEY) {
      const other = iAmBuyer ? c.seller : c.buyer;
      const fromName = iAmBuyer ? c.buyer.name : (c.seller.store?.name || c.seller.name);
      sendEmail({ to: other.email, subject: `New message from ${fromName} — Flamingo Market`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <p style="font-size:14px;"><b>${escapeHtml(fromName)}</b> sent you a message:</p>
          <p style="background:#fff0f7;border-radius:12px;padding:14px;font-size:14px;color:#444;white-space:pre-wrap">${escapeHtml(text.slice(0, 300))}</p>
          <p><a href="${process.env.NEXTAUTH_URL}/messages?c=${c.id}" style="background:#e8267a;color:#fff;text-decoration:none;padding:10px 22px;border-radius:99px;font-weight:700;font-size:13px;">Reply →</a></p></div>` }).catch(e => console.error("[CHAT_EMAIL]", e));
    }
    return NextResponse.json(msg);
  } catch (err) { console.error("[CHAT_SEND]", err); return NextResponse.json({ error: "Could not send message" }, { status: 500 }); }
}
