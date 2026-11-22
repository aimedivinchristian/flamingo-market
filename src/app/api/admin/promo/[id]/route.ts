import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function requireAdmin() { const session = await getServerSession(authOptions); if (!session || session.user.role !== "ADMIN") return null; return session; }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const updated = await prisma.promoCode.update({ where: { id: params.id }, data: { ...(data.isActive !== undefined && { isActive: data.isActive }), ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }), ...(data.maxUses !== undefined && { maxUses: data.maxUses ? parseInt(data.maxUses) : null }) }, include: { _count: { select: { usages: true } } } });
  return NextResponse.json(updated);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.promoCode.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
