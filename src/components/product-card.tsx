import Link from "next/link";
import type { Product } from "@prisma/client";
import { tagsFromStored } from "@/lib/validation/product";

type Props = {
  product: Pick<
    Product,
    | "slug"
    | "title"
    | "description"
    | "type"
    | "tags"
    | "pricingModel"
    | "priceCents"
    | "currency"
    | "viewCount"
  >;
};

const typeLabel: Record<string, string> = {
  skill: "Skill",
  mcp: "MCP",
  plugin: "Plugin",
};

const typeAccent: Record<string, string> = {
  skill: "border-l-indigo-500",
  mcp: "border-l-violet-500",
  plugin: "border-l-fuchsia-500",
};

export function ProductCard({ product }: Props) {
  const tagList = tagsFromStored(product.tags);
  const excerpt =
    product.description.length > 130
      ? `${product.description.slice(0, 130)}…`
      : product.description;

  const accent = typeAccent[product.type] ?? "border-l-zinc-400";

  return (
    <Link
      href={`/p/${product.slug}`}
      className={`card group flex h-full flex-col border-l-4 ${accent} p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/25`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {typeLabel[product.type] ?? product.type}
        </span>
        <div className="flex items-center gap-2">
          {product.viewCount > 0 && (
            <span
              className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500"
              title="详情页打开次数"
            >
              {product.viewCount} 次浏览
            </span>
          )}
          {product.pricingModel === "paid" ? (
            <span className="text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400">
              {(product.priceCents / 100).toFixed(2)} {product.currency.toUpperCase()}
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              免费
            </span>
          )}
        </div>
      </div>
      <h2 className="text-base font-semibold leading-snug text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
        {product.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {excerpt}
      </p>
      {tagList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tagList.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-md bg-zinc-100/90 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
