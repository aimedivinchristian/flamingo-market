import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pushToUsers, pushToAdmins } from "@/lib/push";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, sellerStatus: true, sellerApplication: true, sellerNote: true, phone: true } });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(u);
}

// Apply (or update the application) to become a seller
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (me.role !== "BUYER") return NextResponse.json({ error: "Your account is already a seller or admin account" }, { status: 400 });
    const b = await req.json();
    const application = String(b.application || "").trim().slice(0, 1500);
    const phone = String(b.phone || "").trim().slice(0, 30);
    if (application.length < 10) return NextResponse.json({ error: "Tell us a little about your business and what you sell" }, { status: 400 });
    if (phone.length < 8) return NextResponse.json({ error: "A phone number is required so we can reach you" }, { status: 400 });
    await prisma.user.update({ where: { id: me.id }, data: { sellerStatus: "PENDING", sellerApplication: application, phone, sellerNote: null } });
    if (process.env.ADMIN_EMAIL && me.sellerStatus !== "PENDING") {
      await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New seller application — ${me.name}`,
        html: `<p><b>${escapeHtml(me.name)}</b> (${escapeHtml(me.email)}, ${escapeHtml(phone)}) applied to become a seller.</p><p style="white-space:pre-wrap">${escapeHtml(application)}</p><p><a href="${process.env.NEXTAUTH_URL}/admin/sellers">Review applications</a></p>` }).catch(() => {});
    }
    if (me.sellerStatus !== "PENDING") await pushToAdmins({ title: "New seller application", body: `${me.name} wants to sell on Flamingo`, url: "/admin/sellers" });
    return NextResponse.json({ success: true });
  } catch (err) { console.error("[SELLER_APPLY]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
