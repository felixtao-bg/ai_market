import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "未配置" }, { status: 503 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "缺少签名" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "签名校验失败" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }
    const pi =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent &&
            typeof session.payment_intent === "object" &&
            "id" in session.payment_intent
          ? session.payment_intent.id
          : null;
    await prisma.order.updateMany({
      where: {
        id: orderId,
        stripeSessionId: session.id,
        status: "pending",
      },
      data: {
        status: "paid",
        ...(pi ? { stripePaymentIntent: pi } : {}),
      },
    });
  }

  return NextResponse.json({ received: true });
}
