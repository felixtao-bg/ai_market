import Link from "next/link";
import { auth } from "@/auth";
import { ProductCard } from "@/components/product-card";
import {
  listPublishedProducts,
  type MarketSort,
} from "@/lib/products-query";
import type { ProductType } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  page?: string;
  sort?: string;
}>;

function buildMarketHref(opts: {
  q?: string;
  type?: string;
  page?: number;
  sort?: MarketSort;
}) {
  const p = new URLSearchParams();
  if (opts.q) p.set("q", opts.q);
  if (opts.type) p.set("type", opts.type);
  if (opts.sort === "hot") p.set("sort", "hot");
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const s = p.toString();
  return s ? `/market?${s}` : "/market";
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const typeParam = sp.type;
  const sort: MarketSort = sp.sort === "hot" ? "hot" : "new";

  const type =
    typeParam === "skill" || typeParam === "mcp" || typeParam === "plugin"
      ? (typeParam as ProductType)
      : undefined;

  const session = await auth();
  const { items, total, page: currentPage, totalPages, sort: activeSort } =
    await listPublishedProducts({
      q,
      type,
      page: Number.isFinite(page) ? page : 1,
      sort,
    });

  const marketHref = (pageNum: number) =>
    buildMarketHref({ q, type: typeParam, page: pageNum, sort: activeSort });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">市场</h1>
          <p className="page-sub">
            现在一共 {total} 条已发布。按更新时间或浏览热度排。
          </p>
        </div>
        <Link
          href={session?.user ? "/dashboard/products/new" : "/login"}
          className="btn-primary w-fit shrink-0"
        >
          上架
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={buildMarketHref({ q, type: typeParam, sort: "new" })}
          className={
            activeSort === "new"
              ? "btn-primary !py-2 !text-xs"
              : "btn-secondary !py-2 !text-xs"
          }
        >
          最新
        </Link>
        <Link
          href={buildMarketHref({ q, type: typeParam, sort: "hot" })}
          className={
            activeSort === "hot"
              ? "btn-primary !py-2 !text-xs"
              : "btn-secondary !py-2 !text-xs"
          }
        >
          热度
        </Link>
      </div>

      <form
        method="get"
        className="card mb-10 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
      >
        {activeSort === "hot" && <input type="hidden" name="sort" value="hot" />}
        <input
          name="q"
          defaultValue={q}
          placeholder="搜标题、正文、标签…"
          className="input min-w-[200px] flex-1 sm:max-w-md"
        />
        <select
          name="type"
          defaultValue={typeParam ?? ""}
          className="input w-full sm:w-40"
        >
          <option value="">全部类型</option>
          <option value="skill">Skill</option>
          <option value="mcp">MCP</option>
          <option value="plugin">Plugin</option>
        </select>
        <button type="submit" className="btn-primary w-full sm:w-auto">
          搜索
        </button>
      </form>

      {items.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            这儿现在是空的。换几个词试试，或者你先来一条。
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            本机 Cursor 技能可执行{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">
              npx prisma db seed
            </code>{" "}
            导入。
          </p>
          <Link
            href={session?.user ? "/dashboard/products/new" : "/login"}
            className="link-accent mt-4 inline-block text-sm"
          >
            去上架
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex justify-center gap-2 text-sm">
          {currentPage > 1 && (
            <Link
              href={marketHref(currentPage - 1)}
              className="btn-secondary !px-4 !py-2"
            >
              上一页
            </Link>
          )}
          <span className="flex items-center px-3 text-zinc-500">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={marketHref(currentPage + 1)}
              className="btn-secondary !px-4 !py-2"
            >
              下一页
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
