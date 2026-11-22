import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: email.trim() } });
    if (existing) return NextResponse.json({ success: true, alreadySubscribed: true });

    await prisma.newsletterSubscriber.create({ data: { email: email.trim() } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[NEWSLETTER_SUBSCRIBE]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
