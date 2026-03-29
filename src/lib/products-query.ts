import type { Prisma, ProductType } from "@prisma/client";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

export type MarketSort = "new" | "hot";

export type MarketFilters = {
  q?: string;
  type?: ProductType;
  page?: number;
  sort?: MarketSort;
};

export async function listPublishedProducts(filters: MarketFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = filters.q?.trim();
  const sort: MarketSort = filters.sort === "hot" ? "hot" : "new";

  const where: Prisma.ProductWhereInput = {
    status: "published",
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (q) {
    const needle = q.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: needle } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "hot"
      ? [{ viewCount: "desc" }, { updatedAt: "desc" }]
      : [{ updatedAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true, image: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    sort,
  };
}

export async function getPublishedBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: {
      owner: { select: { name: true, image: true, email: true } },
    },
  });
}

/** 首页侧栏：已发布 Skill 按浏览量 */
export async function listHotSkills(limit: number) {
  return prisma.product.findMany({
    where: { status: "published", type: "skill" },
    orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
    },
  });
}
