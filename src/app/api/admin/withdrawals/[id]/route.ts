import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, escapeHtml } from "@/lib/email";

// Allowed moves: PENDING -> APPROVED | REJECTED, APPROVED -> PAID | REJECTED
const NEXT: Record<string, string[]> = { PENDING: ["APPROVED", "REJECTED"], APPROVED: ["PAID", "REJECTED"], PAID: [], REJECTED: [] };

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { status, note } = await req.json();
    const w = await prisma.withdrawal.findUnique({ where: { id: params.id }, include: { seller: { select: { name: true, email: true } } } });
    if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!NEXT[w.status]?.includes(status)) return NextResponse.json({ error: `Cannot change ${w.status} to ${status}` }, { status: 400 });
    const updated = await prisma.withdrawal.update({ where: { id: params.id }, data: { status, note: note?.trim() || w.note } });
    try {
      await sendEmail({ to: w.seller.email, subject: `Withdrawal ${status.toLowerCase()} — RWF ${w.amount.toLocaleString()}`,
        html: `<p>Hi ${escapeHtml(w.seller.name)}, your withdrawal request of <b>RWF ${w.amount.toLocaleString()}</b> is now <b>${status}</b>.</p>${note ? `<p>Note: ${escapeHtml(note)}</p>` : ""}` });
    } catch (e) { console.error("[WITHDRAWAL_EMAIL]", e); }
    return NextResponse.json(updated);
  } catch (err) { console.error("[ADMIN_WITHDRAWAL]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
