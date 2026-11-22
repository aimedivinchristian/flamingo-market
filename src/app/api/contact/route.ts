import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, escapeHtml } from "@/lib/email";
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const name = String(b.name || "").trim().slice(0, 100);
    const email = String(b.email || "").trim().toLowerCase().slice(0, 150);
    const message = String(b.message || "").trim().slice(0, 4000);
    if (!name || !email || !message) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    const recent = await prisma.contactMessage.count({ where: { email, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } } });
    if (recent >= 3) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    await prisma.contactMessage.create({ data: { name, email, message } });
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendEmail({ to: process.env.ADMIN_EMAIL, replyTo: email, subject: `New contact message from ${name}`,
          html: `<p><b>${escapeHtml(name)}</b> (${escapeHtml(email)})</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>` });
      } catch (e) { console.error("[CONTACT_EMAIL]", e); }
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error("[CONTACT]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
