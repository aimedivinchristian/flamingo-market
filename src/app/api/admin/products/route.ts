import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function requireAdmin() { const session = await getServerSession(authOptions); if (!session || session.user.role !== "ADMIN") return null; return session; }
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || ""; const category = searchParams.get("category") || ""; const statusF = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1"); const limit = parseInt(searchParams.get("limit") || "20"); const skip = (page - 1) * limit;
  const where: any = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (statusF === "active") where.isActive = true; if (statusF === "inactive") where.isActive = false; if (statusF === "featured") where.isFeatured = true;
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, seller: { select: { id: true, name: true, email: true } }, store: { select: { id: true, name: true } }, _count: { select: { orderItems: true, reviews: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.product.count({ where }),
  ]);
  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids, action } = await req.json();
  if (!ids?.length || !action) return NextResponse.json({ error: "ids and action required" }, { status: 400 });
  const VALID = ["activate","deactivate","feature","unfeature","delete"];
  if (!VALID.includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (action === "delete") { await prisma.product.deleteMany({ where: { id: { in: ids } } }); return NextResponse.json({ success: true, affected: ids.length }); }
  const data: any = {};
  if (action === "activate") data.isActive = true; if (action === "deactivate") data.isActive = false; if (action === "feature") data.isFeatured = true; if (action === "unfeature") data.isFeatured = false;
  const result = await prisma.product.updateMany({ where: { id: { in: ids } }, data });
  return NextResponse.json({ success: true, affected: result.count });
}
