import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await rateLimit(`pwchange:${session.user.id}`, 5, 15 * 60);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const { currentPassword, newPassword } = await req.json();
  if (typeof newPassword !== "string" || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) return NextResponse.json({ error: "New password needs 8+ characters with letters and numbers" }, { status: 400 });
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!u?.password) return NextResponse.json({ error: "This account signs in with Google — no password to change" }, { status: 400 });
  if (!(await bcrypt.compare(String(currentPassword || ""), u.password))) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { password: await bcrypt.hash(newPassword, 12) } });
  return NextResponse.json({ success: true });
}
