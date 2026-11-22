import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import prisma                        from "@/lib/prisma";
import { sendOrderNotification }     from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const meta            = checkoutSession.metadata!;

    try {
      const items = JSON.parse(meta.items) as { productId: string; quantity: number }[];

      // Build order items with current prices
      const orderItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
      }

      const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

      // Create confirmed order
      const order = await prisma.order.create({
        data: {
          buyerId: meta.buyerId,
          total,
          address: meta.address,
          phone:   meta.phone,
          notes:   meta.notes || null,
          status:  "CONFIRMED",
          items:   { create: orderItems },
        },
        include: {
          items:  { include: { product: { select: { name: true } } } },
          buyer:  { select: { name: true, email: true } },
        },
      });

      // Decrease stock
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      // Notify admin
      await sendOrderNotification(order);

      console.log("[WEBHOOK] Order created:", order.id);
    } catch (err) {
      console.error("[WEBHOOK] Order creation failed:", err);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
