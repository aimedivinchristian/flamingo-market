import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { status, note } = await req.json();
    if (!["APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const b = await prisma.boostRequest.findUnique({ where: { id: params.id }, include: { product: true, seller: { select: { name: true, email: true } } } });
    if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (b.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });
    if (status === "APPROVED") {
      const start = b.product.boostUntil && b.product.boostUntil > new Date() ? b.product.boostUntil : new Date();
      await prisma.product.update({ where: { id: b.productId }, data: { boostUntil: new Date(start.getTime() + b.days * 86400_000) } });
    }
    const updated = await prisma.boostRequest.update({ where: { id: b.id }, data: { status, note: note?.trim() || null } });
    await sendEmail({ to: b.seller.email, subject: `Boost ${status.toLowerCase()} — ${b.product.name}`, html: `<p>Hi ${escapeHtml(b.seller.name)}, your ${b.days}-day boost for "<b>${escapeHtml(b.product.name)}</b>" was <b>${status}</b>.${note ? ` Note: ${escapeHtml(note)}` : ""}</p>` }).catch(() => {});
    await audit({ id: session.user.id, email: session.user.email }, `boost.${String(status).toLowerCase()}`, b.id, { product: b.product.name, days: b.days, amount: b.amount });
    return NextResponse.json(updated);
  } catch (err) { console.error("[ADMIN_BOOST]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
