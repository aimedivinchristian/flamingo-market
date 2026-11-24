import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, tooMany, clientIp } from "@/lib/rate-limit";
import { verifyOtp } from "@/lib/otp";
export async function POST(req: NextRequest) {
  try {
    { const ip = clientIp(req); const r = await rateLimit(`otp-verify:ip:${ip}`, 30, 15 * 60); if (!r.ok) return tooMany(r.retryAfter); }
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    if (!email || !code) return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    const result = await verifyOtp(email, code, "VERIFY");
    if (!result.valid) return NextResponse.json({ error: result.reason }, { status: 400 });
    const user = await prisma.user.update({ where: { email }, data: { emailVerified: new Date() }, select: { id: true, email: true, name: true, role: true } });
    return NextResponse.json({ success: true, user });
  } catch (err) { console.error("[VERIFY_OTP]", err); return NextResponse.json({ error: "Verification failed." }, { status: 500 }); }
}
