import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.withdrawal.findMany({ orderBy: { createdAt: "desc" }, include: { seller: { select: { name: true, email: true, phone: true } } } });
  return NextResponse.json(rows);
}
