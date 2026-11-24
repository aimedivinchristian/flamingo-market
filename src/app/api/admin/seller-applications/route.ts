import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pushToUsers, pushToAdmins } from "@/lib/push";
import { audit } from "@/lib/audit";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { status, note } = await req.json();
    if (!["APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const u = await prisma.user.findUnique({ where: { id: params.id } });
    if (!u || u.role !== "BUYER" || !u.sellerStatus) return NextResponse.json({ error: "No open application for this user" }, { status: 404 });
    const updated = await prisma.user.update({
      where: { id: u.id },
      data: status === "APPROVED" ? { role: "SELLER", sellerStatus: "APPROVED", sellerNote: null } : { sellerStatus: "REJECTED", sellerNote: String(note || "").trim().slice(0, 300) || null },
      select: { id: true, sellerStatus: true },
    });
    await sendEmail({ to: u.email, subject: status === "APPROVED" ? "You're approved as a seller 🎉" : "Your seller application",
      html: status === "APPROVED"
        ? `<p>Hi ${escapeHtml(u.name)}, your seller account on Flamingo Market is approved. Sign out and in again, then open your <a href="${process.env.NEXTAUTH_URL}/seller">seller dashboard</a> to create your store and add products.</p>`
        : `<p>Hi ${escapeHtml(u.name)}, we couldn't approve your seller application${note ? `: ${escapeHtml(String(note))}` : ""}. You can update your details and apply again at <a href="${process.env.NEXTAUTH_URL}/become-seller">${process.env.NEXTAUTH_URL}/become-seller</a>.</p>` }).catch(() => {});
    await audit({ id: session.user.id, email: session.user.email }, `seller.${status.toLowerCase()}`, u.email, { note: note || null });
    await pushToUsers([u.id], { title: status === "APPROVED" ? "You're approved! 🎉" : "Seller application update", body: status === "APPROVED" ? "Sign in again to open your seller dashboard" : "Open to see the reason", url: status === "APPROVED" ? "/seller" : "/become-seller" });
    return NextResponse.json(updated);
  } catch (err) { console.error("[SELLER_APPROVAL]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
