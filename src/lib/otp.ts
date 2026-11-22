import { randomInt } from "crypto";
import prisma from "./prisma";
import { sendEmail, escapeHtml } from "./email";

export type OtpPurpose = "VERIFY" | "RESET";
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

export function generateOtp(): string { return randomInt(100000, 1000000).toString(); }

/** Seconds the caller must still wait before another code may be requested (0 = allowed). */
export async function cooldownLeft(email: string, purpose: OtpPurpose): Promise<number> {
  const last = await prisma.otpCode.findFirst({ where: { email, purpose }, orderBy: { createdAt: "desc" } });
  if (!last) return 0;
  const left = last.createdAt.getTime() + RESEND_COOLDOWN_MS - Date.now();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

export async function createOtp(email: string, purpose: OtpPurpose = "VERIFY"): Promise<string> {
  await prisma.otpCode.updateMany({ where: { email, purpose, used: false }, data: { used: true } });
  const code = generateOtp();
  await prisma.otpCode.create({ data: { email, purpose, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  return code;
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose = "VERIFY"): Promise<{ valid: boolean; reason?: string }> {
  const record = await prisma.otpCode.findFirst({ where: { email, purpose, used: false }, orderBy: { createdAt: "desc" } });
  if (!record) return { valid: false, reason: "Invalid or expired code. Request a new one." };
  if (new Date() > record.expiresAt) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
    return { valid: false, reason: "Code has expired. Please request a new one." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
    return { valid: false, reason: "Too many wrong attempts. Please request a new code." };
  }
  if (record.code !== code) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { valid: false, reason: "Invalid code" };
  }
  await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
  return { valid: true };
}

function otpHtml(name: string, code: string, intro: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:20px;">
  <div style="background:linear-gradient(135deg,#e8267a,#f04d96);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
    <div style="font-size:32px;">🦩</div><div style="color:white;font-size:20px;font-weight:800;">FLAMINGO MARKET</div>
  </div>
  <p style="font-size:15px;font-weight:700;">Hi ${escapeHtml(name)},</p>
  <p style="font-size:14px;color:#666;">${intro}</p>
  <div style="background:#fff0f7;border:2px solid #ffe0ef;border-radius:16px;padding:24px;text-align:center;margin:20px 0;">
    <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#1a1a2e;">${code}</div>
    <p style="font-size:12px;color:#aaa;margin-top:8px;">Expires in 10 minutes</p>
  </div>
  <p style="font-size:12px;color:#999;">If you didn't request this, you can safely ignore this email.</p>
</div>`;
}

export async function sendOtpEmail(email: string, name: string, code: string) {
  await sendEmail({ to: email, subject: `${code} — Your Flamingo Market verification code`, html: otpHtml(name, code, "Use this code to verify your email:") });
}

export async function sendResetEmail(email: string, name: string, code: string) {
  await sendEmail({ to: email, subject: `${code} — Reset your Flamingo Market password`, html: otpHtml(name, code, "Use this code to reset your password:") });
}
