import prisma from "@/lib/prisma";

export async function userHasPaidForProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  const row = await prisma.order.findFirst({
    where: {
      buyerId: userId,
      status: "paid",
      lines: { some: { productId } },
    },
    select: { id: true },
  });
  return !!row;
}
