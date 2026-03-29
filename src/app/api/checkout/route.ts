import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Stripe 未配置" },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const productId = body.productId;
  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "缺少 productId" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: "published",
      pricingModel: "paid",
    },
  });

  if (!product || product.priceCents <= 0) {
    return NextResponse.json({ error: "商品不可购买" }, { status: 400 });
  }

  if (product.ownerId === session.user.id) {
    return NextResponse.json({ error: "不能购买自己的商品" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);

  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      status: "pending",
      totalCents: product.priceCents,
      currency: product.currency,
      lines: {
        create: [
          {
            productId: product.id,
            priceCents: product.priceCents,
            quantity: 1,
          },
        ],
      },
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/dashboard/purchases?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/p/${product.slug}?canceled=1`,
    metadata: {
      orderId: order.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: product.priceCents,
          product_data: {
            name: product.title,
            description: product.description.slice(0, 500),
          },
        },
      },
    ],
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "无法创建结账链接" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
