import prisma from "./prisma";

export type PromoResult = { ok: true; promoId: string; discount: number } | { ok: false; error: string };

/** Server-side promo validation. The only source of truth for discounts. */
export async function evaluatePromo(ref: { id?: string; code?: string }, userId: string, orderTotal: number): Promise<PromoResult> {
  const promo = ref.id
    ? await prisma.promoCode.findUnique({ where: { id: ref.id }, include: { _count: { select: { usages: true } } } })
    : await prisma.promoCode.findUnique({ where: { code: String(ref.code || "").trim().toUpperCase() }, include: { _count: { select: { usages: true } } } });
  if (!promo) return { ok: false, error: "Invalid promo code" };
  if (!promo.isActive) return { ok: false, error: "This promo code is no longer active" };
  if (promo.expiresAt && new Date() > promo.expiresAt) return { ok: false, error: "This promo code has expired" };
  if (promo.maxUses !== null && promo._count.usages >= promo.maxUses) return { ok: false, error: "This promo code has reached its usage limit" };
  if (orderTotal < promo.minOrder) return { ok: false, error: `Minimum order of RWF ${promo.minOrder.toLocaleString()} required` };
  const used = await prisma.promoUsage.findUnique({ where: { promoId_userId: { promoId: promo.id, userId } } });
  if (used) return { ok: false, error: "You have already used this promo code" };
  const discount = promo.type === "PERCENT" ? Math.round((orderTotal * promo.value) / 100) : Math.min(promo.value, orderTotal);
  return { ok: true, promoId: promo.id, discount: Math.max(0, Math.min(discount, orderTotal)) };
}
