import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SELLER","ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { amount, method, accountNo, accountName, note } = await req.json();
    if (!amount || amount < 5000) return NextResponse.json({ error: "Minimum withdrawal is RWF 5,000" }, { status: 400 });
    if (!method || !accountNo?.trim() || !accountName?.trim()) return NextResponse.json({ error: "All payment details are required" }, { status: 400 });
    if (!["momo","bank"].includes(method)) return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    const items = await prisma.orderItem.findMany({ where: { product: { sellerId: session.user.id }, order: { status: "DELIVERED" } }, select: { price: true, quantity: true } });
    const totalEarned = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const netEarned = totalEarned * 0.90;
    const withdrawn = await prisma.withdrawal.aggregate({ where: { sellerId: session.user.id, status: { in: ["PENDING","APPROVED","PAID"] } }, _sum: { amount: true } });
    const alreadyWithdrawn = withdrawn._sum.amount ?? 0;
    const available = netEarned - alreadyWithdrawn;
    if (amount > available) return NextResponse.json({ error: `Insufficient balance. Available: RWF ${Math.floor(available).toLocaleString()}` }, { status: 400 });
    const withdrawal = await prisma.withdrawal.create({ data: { sellerId: session.user.id, amount: parseFloat(String(amount)), method, accountNo: accountNo.trim(), accountName: accountName.trim(), note: note?.trim() || null } });
    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) { console.error("[WITHDRAWAL]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
