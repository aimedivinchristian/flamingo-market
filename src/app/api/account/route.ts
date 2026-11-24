import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, phone: true, role: true, password: true } });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ name: u.name, email: u.email, phone: u.phone, role: u.role, hasPassword: !!u.password });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const name = String(b.name ?? "").trim().slice(0, 80);
  const phone = String(b.phone ?? "").trim().slice(0, 20);
  if (name.length < 2) return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  if (phone && !/^\+?[\d\s-]{8,20}$/.test(phone)) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { name, phone: phone || null } });
  return NextResponse.json({ success: true });
}
