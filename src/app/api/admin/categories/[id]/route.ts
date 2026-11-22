import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function requireAdmin() { const session = await getServerSession(authOptions); if (!session || session.user.role !== "ADMIN") return null; return session; }
function slugify(str: string) { return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"); }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, emoji } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const slug = slugify(name);
  const conflict = await prisma.category.findFirst({ where: { slug, NOT: { id: params.id } } });
  if (conflict) return NextResponse.json({ error: `Slug "${slug}" already taken` }, { status: 409 });
  const updated = await prisma.category.update({ where: { id: params.id }, data: { name: name.trim(), slug, ...(emoji?.trim() && { emoji: emoji.trim() }) }, include: { _count: { select: { products: true } } } });
  return NextResponse.json(updated);
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { reassignTo } = await req.json().catch(() => ({ reassignTo: null }));
  const count = await prisma.product.count({ where: { categoryId: params.id } });
  if (count > 0) { if (!reassignTo) return NextResponse.json({ error: "NEEDS_REASSIGN", productCount: count }, { status: 409 }); await prisma.product.updateMany({ where: { categoryId: params.id }, data: { categoryId: reassignTo } }); }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, reassigned: count });
}
