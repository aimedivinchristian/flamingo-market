import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function requireAdmin() { const session = await getServerSession(authOptions); if (!session || session.user.role !== "ADMIN") return null; return session; }
function slugify(str: string) { return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"); }
export async function GET() {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}
export async function POST(req: NextRequest) {
  const s = await requireAdmin(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, emoji } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  if (!emoji?.trim()) return NextResponse.json({ error: "An icon/emoji is required" }, { status: 400 });
  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: `A category with slug "${slug}" already exists` }, { status: 409 });
  const category = await prisma.category.create({ data: { name: name.trim(), slug, emoji: emoji.trim() }, include: { _count: { select: { products: true } } } });
  return NextResponse.json(category, { status: 201 });
}
