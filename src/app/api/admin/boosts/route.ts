import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.boostRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { product: { select: { name: true, boostUntil: true } }, seller: { select: { name: true, email: true, phone: true } } } }));
}
