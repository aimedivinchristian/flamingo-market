import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function requireAdmin() { const session = await getServerSession(authOptions); if (!session || session.user.role !== "ADMIN") return null; return session; }
export async function GET() {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await prisma.promoCode.findMany({ include: { _count: { select: { usages: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}
export async function POST(req: NextRequest) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { code, type, value, minOrder, maxUses, expiresAt } = await req.json();
  if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Type is required" }, { status: 400 });
  if (!value || value <= 0) return NextResponse.json({ error: "Value must be > 0" }, { status: 400 });
  if (type === "PERCENT" && value > 100) return NextResponse.json({ error: "Percentage cannot exceed 100" }, { status: 400 });
  const existing = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  const promo = await prisma.promoCode.create({ data: { code: code.trim().toUpperCase(), type, value: parseFloat(String(value)), minOrder: parseFloat(String(minOrder || 0)), maxUses: maxUses ? parseInt(String(maxUses)) : null, expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: true }, include: { _count: { select: { usages: true } } } });
  return NextResponse.json(promo, { status: 201 });
}
