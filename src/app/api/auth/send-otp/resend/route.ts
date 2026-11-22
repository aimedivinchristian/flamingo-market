import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtp, sendOtpEmail, cooldownLeft } from "@/lib/otp";
export async function POST(req: NextRequest) {
  try {
    const { email: raw } = await req.json();
    const email = String(raw || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "No account found" }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    const wait = await cooldownLeft(email, "VERIFY");
    if (wait > 0) return NextResponse.json({ error: `Please wait ${wait}s before requesting another code` }, { status: 429 });
    const code = await createOtp(email, "VERIFY");
    await sendOtpEmail(email, user.name, code);
    return NextResponse.json({ success: true, message: "New code sent to your email" });
  } catch (err) { console.error("[RESEND_OTP]", err); return NextResponse.json({ error: "Failed to send the email. Please try again shortly." }, { status: 500 }); }
}
