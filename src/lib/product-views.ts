import prisma from "@/lib/prisma";

/** 详情页浏览 +1，用于热度排序 */
export async function recordProductView(productId: string): Promise<void> {
  try {
    await prisma.product.updateMany({
      where: { id: productId, status: "published" },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // 忽略统计失败，不影响页面
  }
}
