"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { slugify, uniqueSlugSuffix } from "@/lib/slug";
import {
  cleanDistribution,
  productFormSchema,
  tagsToStored,
  toPrismaEnums,
} from "@/lib/validation/product";

export type ActionState = { error?: string; ok?: boolean };

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base || `item-${uniqueSlugSuffix()}`;
  for (let i = 0; i < 8; i++) {
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${uniqueSlugSuffix()}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "请先登录" };

  const raw = Object.fromEntries(formData.entries());
  const tags = String(raw.tags ?? "")
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = productFormSchema.safeParse({
    title: raw.title,
    description: raw.description,
    type: raw.type,
    tags,
    pricingModel: raw.pricingModel,
    priceCents: raw.priceCents,
    currency: raw.currency || "usd",
    distribution: {
      repoUrl: raw.repoUrl,
      npmPackage: raw.npmPackage,
      docUrl: raw.docUrl,
      installHint: raw.installHint,
    },
    status: raw.status,
  });

  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error:
        f.priceCents?.[0] ??
        f.title?.[0] ??
        f.description?.[0] ??
        "表单校验失败",
    };
  }

  const enums = toPrismaEnums(parsed.data);
  const baseSlug = slugify(parsed.data.title);
  const slug = await ensureUniqueSlug(baseSlug);
  const distribution = cleanDistribution(parsed.data.distribution);

  await prisma.product.create({
    data: {
      ownerId: session.user.id,
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      type: enums.type,
      tags: tagsToStored(parsed.data.tags),
      pricingModel: enums.pricingModel,
      priceCents:
        enums.pricingModel === "paid" ? parsed.data.priceCents : 0,
      currency: parsed.data.currency.toLowerCase(),
      distribution,
      status: enums.status,
    },
  });

  revalidatePath("/market");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(
  productId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "请先登录" };

  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "无权编辑该产品" };
  }

  const raw = Object.fromEntries(formData.entries());
  const tags = String(raw.tags ?? "")
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = productFormSchema.safeParse({
    title: raw.title,
    description: raw.description,
    type: raw.type,
    tags,
    pricingModel: raw.pricingModel,
    priceCents: raw.priceCents,
    currency: raw.currency || "usd",
    distribution: {
      repoUrl: raw.repoUrl,
      npmPackage: raw.npmPackage,
      docUrl: raw.docUrl,
      installHint: raw.installHint,
    },
    status: raw.status,
  });

  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error:
        f.priceCents?.[0] ??
        f.title?.[0] ??
        f.description?.[0] ??
        "表单校验失败",
    };
  }

  const enums = toPrismaEnums(parsed.data);
  const distribution = cleanDistribution(parsed.data.distribution);

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      type: enums.type,
      tags: tagsToStored(parsed.data.tags),
      pricingModel: enums.pricingModel,
      priceCents:
        enums.pricingModel === "paid" ? parsed.data.priceCents : 0,
      currency: parsed.data.currency.toLowerCase(),
      distribution,
      status: enums.status,
    },
  });

  revalidatePath("/market");
  revalidatePath(`/p/${existing.slug}`);
  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}
