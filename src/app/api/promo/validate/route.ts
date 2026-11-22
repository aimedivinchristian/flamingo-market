import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required to use promo codes" }, { status: 401 });
    const { code, orderTotal } = await req.json();
    if (!code?.trim()) return NextResponse.json({ error: "Enter a promo code" }, { status: 400 });
    if (!orderTotal || orderTotal <= 0) return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() }, include: { _count: { select: { usages: true } } } });
    if (!promo) return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    if (!promo.isActive) return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    if (promo.expiresAt && new Date() > promo.expiresAt) return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    if (promo.maxUses !== null && promo._count.usages >= promo.maxUses) return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    if (orderTotal < promo.minOrder) return NextResponse.json({ error: `Minimum order of RWF ${promo.minOrder.toLocaleString()} required` }, { status: 400 });
    const alreadyUsed = await prisma.promoUsage.findUnique({ where: { promoId_userId: { promoId: promo.id, userId: session.user.id } } });
    if (alreadyUsed) return NextResponse.json({ error: "You have already used this promo code" }, { status: 400 });
    let discount = 0;
    if (promo.type === "PERCENT") discount = Math.round((orderTotal * promo.value) / 100); else discount = Math.min(promo.value, orderTotal);
    const finalTotal = Math.max(0, orderTotal - discount);
    return NextResponse.json({ valid: true, promoId: promo.id, code: promo.code, type: promo.type, value: promo.value, discount, finalTotal, message: promo.type === "PERCENT" ? `${promo.value}% off applied — you save RWF ${discount.toLocaleString()}` : `RWF ${promo.value.toLocaleString()} off applied` });
  } catch (err) { console.error("[VALIDATE_PROMO]", err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
