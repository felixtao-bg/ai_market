import type { ProductType, PricingModel, ProductStatus } from "@prisma/client";

export type DistributionPayload = {
  repoUrl?: string;
  npmPackage?: string;
  docUrl?: string;
  installHint?: string;
};

export type { ProductType, PricingModel, ProductStatus };
