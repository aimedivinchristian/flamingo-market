import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { suspended } = await req.json();
  if (typeof suspended !== "boolean") return NextResponse.json({ error: "Invalid" }, { status: 400 });
  if (params.id === session.user.id) return NextResponse.json({ error: "You can't suspend your own account" }, { status: 400 });
  const u = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, role: true } });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (u.role === "ADMIN") return NextResponse.json({ error: "Admin accounts can't be suspended here" }, { status: 400 });
  await prisma.user.update({ where: { id: u.id }, data: { suspended } });
  if (suspended && u.role === "SELLER") await prisma.product.updateMany({ where: { sellerId: u.id }, data: { isActive: false } }); // hide a suspended seller's listings
  await audit({ id: session.user.id, email: session.user.email }, suspended ? "user.suspend" : "user.unsuspend", u.email);
  return NextResponse.json({ success: true });
}
