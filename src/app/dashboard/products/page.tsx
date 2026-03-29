import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const statusLabel: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  hidden: "隐藏",
};

export default async function DashboardProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const products = await prisma.product.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">我上架的</h1>
          <p className="page-sub">草稿、发布、隐藏，你自己拿捏。</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary w-fit">
          新建
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card px-8 py-14 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            一条都还没有。
          </p>
          <Link
            href="/dashboard/products/new"
            className="link-accent mt-3 inline-block text-sm"
          >
            写第一条
          </Link>
        </div>
      ) : (
        <ul className="card divide-y divide-zinc-100 overflow-hidden dark:divide-zinc-800/80">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/p/${p.slug}`}
                  className="font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {p.type} · {statusLabel[p.status] ?? p.status} ·{" "}
                  {p.pricingModel === "paid"
                    ? `${(p.priceCents / 100).toFixed(2)} ${p.currency}`
                    : "免费"}{" "}
                  · {p.viewCount} 浏览
                </p>
              </div>
              <Link
                href={`/dashboard/products/${p.id}/edit`}
                className="link-accent shrink-0 text-sm"
              >
                编辑
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
