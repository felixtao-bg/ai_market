import { z } from "zod";
import type { ProductType, PricingModel, ProductStatus } from "@prisma/client";

const optionalUrl = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.string().url().optional(),
);

export const distributionSchema = z.object({
  repoUrl: optionalUrl,
  npmPackage: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().max(200).optional(),
  ),
  docUrl: optionalUrl,
  installHint: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().max(5000).optional(),
  ),
});

export const productFormSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(20000),
    type: z.enum(["skill", "mcp", "plugin"] as const),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
    pricingModel: z.enum(["free", "paid"] as const),
    priceCents: z.coerce.number().int().min(0).max(1_000_000_00),
    currency: z.string().length(3).default("usd"),
    distribution: distributionSchema,
    status: z.enum(["draft", "published", "hidden"] as const),
  })
  .superRefine((val, ctx) => {
    if (val.pricingModel === "paid" && val.priceCents <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "付费商品价格须大于 0（单位：分）",
        path: ["priceCents"],
      });
    }
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const n = t.trim().toLowerCase();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/** SQLite 等库用逗号存标签 */
export function tagsToStored(tags: string[]): string {
  return normalizeTags(tags).join(",");
}

export function tagsFromStored(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[,，]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function toPrismaEnums(input: ProductFormInput): {
  type: ProductType;
  pricingModel: PricingModel;
  status: ProductStatus;
} {
  return {
    type: input.type as ProductType,
    pricingModel: input.pricingModel as PricingModel,
    status: input.status as ProductStatus,
  };
}

export function cleanDistribution(
  d: ProductFormInput["distribution"],
): Record<string, string> {
  const out: Record<string, string> = {};
  if (d.repoUrl?.trim()) out.repoUrl = d.repoUrl.trim();
  if (d.npmPackage?.trim()) out.npmPackage = d.npmPackage.trim();
  if (d.docUrl?.trim()) out.docUrl = d.docUrl.trim();
  if (d.installHint?.trim()) out.installHint = d.installHint.trim();
  return out;
}
