import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const newPassword = String(body.newPassword || "");
    if (!email || !code || !newPassword) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const result = await verifyOtp(email, code, "RESET");
    if (!result.valid) return NextResponse.json({ error: result.reason }, { status: 400 });
    await prisma.user.update({ where: { email }, data: { password: await bcrypt.hash(newPassword, 12) } });
    return NextResponse.json({ success: true });
  } catch (err) { console.error("[RESET_PASSWORD]", err); return NextResponse.json({ error: "Could not reset password." }, { status: 500 }); }
}
