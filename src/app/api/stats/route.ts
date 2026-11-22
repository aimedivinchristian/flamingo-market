import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* Public — platform-wide real stats for homepage display */
export async function GET() {
  try {
    const [sellerCount, productCount, buyerCount, deliveredOrders] = await Promise.all([
      prisma.store.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]);
    return NextResponse.json({ sellerCount, productCount, buyerCount, deliveredOrders });
  } catch (err) {
    console.error("[GET_STATS]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
