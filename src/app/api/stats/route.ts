import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* Public — platform-wide real stats for homepage display */
export const dynamic = "force-dynamic"; // never freeze at build time

export async function GET() {
  try {
    const [sellerCount, productCount, buyerCount, deliveredOrders] = await Promise.all([
      prisma.store.count({ where: { isVerified: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "BUYER", emailVerified: { not: null } } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]);
    return NextResponse.json({ sellerCount, productCount, buyerCount, deliveredOrders }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) {
    console.error("[GET_STATS]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
