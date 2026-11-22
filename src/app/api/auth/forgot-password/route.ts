import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtp, sendResetEmail, cooldownLeft } from "@/lib/otp";
export async function POST(req: NextRequest) {
  try {
    const { email: raw } = await req.json();
    const email = String(raw || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    // Same response whether or not the account exists (prevents email enumeration).
    if (user && user.password && user.emailVerified) {
      const wait = await cooldownLeft(email, "RESET");
      if (wait > 0) return NextResponse.json({ error: `Please wait ${wait}s before requesting another code` }, { status: 429 });
      const code = await createOtp(email, "RESET");
      await sendResetEmail(email, user.name, code);
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error("[FORGOT_PASSWORD]", err); return NextResponse.json({ error: "Could not send the email. Please try again shortly." }, { status: 500 }); }
}
