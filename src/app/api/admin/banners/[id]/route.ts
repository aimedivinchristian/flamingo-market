import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function admin() { const s = await getServerSession(authOptions); return s && s.user.role === "ADMIN" ? s : null; }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const banner = await prisma.banner.update({ where: { id: params.id }, data: { isActive: typeof b.isActive === "boolean" ? b.isActive : undefined, sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) || 0 : undefined } });
  return NextResponse.json(banner);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
