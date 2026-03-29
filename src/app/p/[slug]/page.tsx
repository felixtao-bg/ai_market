import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { BuyButton } from "@/components/buy-button";
import { recordProductView } from "@/lib/product-views";
import { getPublishedBySlug } from "@/lib/products-query";
import { userHasPaidForProduct } from "@/lib/purchase-access";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedBySlug(slug);
  if (!product) return { title: "未找到" };
  return {
    title: product.title,
    description:
      product.description.length > 160
        ? `${product.description.slice(0, 157)}…`
        : product.description,
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 200),
    },
  };
}

const typeLabel: Record<string, string> = {
  skill: "Skill",
  mcp: "MCP",
  plugin: "Plugin",
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedBySlug(slug);
  if (!product) notFound();

  void recordProductView(product.id);

  const session = await auth();
  const isOwner = session?.user?.id === product.ownerId;
  const hasAccess =
    product.pricingModel === "free" ||
    isOwner ||
    (session?.user?.id
      ? await userHasPaidForProduct(session.user.id, product.id)
      : false);

  const rawDist = product.distribution as Record<string, string>;
  const dist = hasAccess
    ? rawDist
    : {
        ...(rawDist.docUrl ? { docUrl: rawDist.docUrl } : {}),
      };

  const showLockedNotice =
    product.pricingModel === "paid" && !hasAccess && !isOwner;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <Link
        href="/market"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <span aria-hidden>←</span> 回市场
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {typeLabel[product.type] ?? product.type}
        </span>
        {product.pricingModel === "paid" ? (
          <span className="text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-400">
            {(product.priceCents / 100).toFixed(2)} {product.currency.toUpperCase()}
          </span>
        ) : (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            免费
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        {product.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span>作者：{product.owner.name ?? product.owner.email ?? "匿名"}</span>
        <span className="tabular-nums text-zinc-400 dark:text-zinc-500">
          {product.viewCount} 次浏览
        </span>
      </div>

      <article className="mt-10 whitespace-pre-wrap text-[15px] leading-[1.7] text-zinc-700 dark:text-zinc-300">
        {product.description}
      </article>

      {showLockedNotice && (
        <div className="mt-10 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">付费才给全量信息</p>
          <p className="mt-2 leading-relaxed opacity-90">
            仓库、npm、安装说明这类内容，付完款才看得到。文档链接有时作者会留一条公开的，上面若有就先看那个。
          </p>
          {session?.user ? (
            <div className="mt-5">
              <BuyButton productId={product.id} />
            </div>
          ) : (
            <Link href="/login" className="btn-primary mt-4 inline-flex">
              登录再买
            </Link>
          )}
        </div>
      )}

      <section className="card mt-12 space-y-4 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          怎么拿
        </h2>
        {dist.repoUrl && (
          <div className="text-sm">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              仓库
            </span>
            <a
              href={dist.repoUrl}
              className="link-accent mt-1 block break-all"
              target="_blank"
              rel="noreferrer"
            >
              {dist.repoUrl}
            </a>
          </div>
        )}
        {dist.npmPackage && (
          <p className="text-sm">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              npm{" "}
            </span>
            <code className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {dist.npmPackage}
            </code>
          </p>
        )}
        {dist.docUrl && (
          <div className="text-sm">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              文档
            </span>
            <a
              href={dist.docUrl}
              className="link-accent mt-1 block break-all"
              target="_blank"
              rel="noreferrer"
            >
              {dist.docUrl}
            </a>
          </div>
        )}
        {dist.installHint && (
          <div className="text-sm">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              安装说明
            </span>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-[13px] leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {dist.installHint}
            </pre>
          </div>
        )}
        {!dist.repoUrl &&
          !dist.npmPackage &&
          !dist.docUrl &&
          !dist.installHint && (
            <p className="text-sm text-zinc-500">作者还没填获取方式。</p>
          )}
      </section>

      {isOwner && (
        <div className="mt-8">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="link-accent text-sm"
          >
            编辑这条
          </Link>
        </div>
      )}
    </main>
  );
}
