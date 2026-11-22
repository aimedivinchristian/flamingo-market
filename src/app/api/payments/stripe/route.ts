import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import Stripe                        from "stripe";
import prisma                        from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const { items, address, phone, notes } = await req.json();

    if (!items?.length || !address || !phone) {
      return NextResponse.json({ error: "Missing checkout details" }, { status: 400 });
    }

    // Validate products & build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });

      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for: ${product.name}` }, { status: 400 });
      }

      totalAmount += product.price * item.quantity;

      lineItems.push({
        price_data: {
          currency:     "rwf",
          unit_amount:  Math.round(product.price), // RWF has no decimal
          product_data: {
            name:        product.name,
            description: product.description.slice(0, 200),
            images:      product.images.slice(0, 1),
          },
        },
        quantity: item.quantity,
      });
    }

    // Store pending order info in metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items:           lineItems,
      mode:                 "payment",
      currency:             "rwf",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/checkout/cancelled`,
      customer_email: session.user.email!,
      metadata: {
        buyerId: session.user.id,
        address,
        phone,
        notes:   notes ?? "",
        items:   JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (err) {
    console.error("[STRIPE_CHECKOUT]", err);
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
