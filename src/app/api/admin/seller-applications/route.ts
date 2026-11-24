import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.user.findMany({
    where: { sellerStatus: { in: ["PENDING", "REJECTED"] }, role: "BUYER", emailVerified: { not: null } },
    orderBy: { updatedAt: "desc" }, take: 200,
    select: { id: true, name: true, email: true, phone: true, sellerStatus: true, sellerApplication: true, sellerNote: true, createdAt: true },
  });
  return NextResponse.json(rows);
}
