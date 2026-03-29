import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** 创建 SIWE 用的一次性 nonce，10 分钟内有效 */
export async function POST() {
  await prisma.siweChallenge.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.siweChallenge.create({
    data: { nonce, expiresAt },
  });

  return NextResponse.json({ nonce });
}
