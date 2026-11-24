import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOtp, sendOtpEmail, cooldownLeft } from "@/lib/otp";
import bcrypt from "bcryptjs";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const { password, role } = body;
    if (!name || !email || !password) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    const wait = await cooldownLeft(email, "VERIFY");
    if (wait > 0) return NextResponse.json({ error: `Please wait ${wait}s before requesting another code` }, { status: 429 });
    const hashed = await bcrypt.hash(password, 12);
    // Nobody becomes a seller just by signing up: choosing "sell" creates a BUYER with a PENDING seller application
    // that an admin must approve (see /admin/sellers).
    const wantsSeller = role === "SELLER";
    const sellerStatus = wantsSeller ? "PENDING" : null;
    await prisma.user.upsert({ where: { email }, update: { name, password: hashed, role: "BUYER", sellerStatus, emailVerified: null }, create: { name, email, password: hashed, role: "BUYER", sellerStatus } });
    const code = await createOtp(email, "VERIFY");
    await sendOtpEmail(email, name, code);
    return NextResponse.json({ success: true, message: "Verification code sent to your email" });
  } catch (err) { console.error("[SEND_OTP]", err); return NextResponse.json({ error: "Could not send the verification email. Please try again shortly." }, { status: 500 }); }
}
