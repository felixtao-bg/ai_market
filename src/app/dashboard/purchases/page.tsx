import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const statusLabel: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  failed: "失败",
  canceled: "已取消",
};

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const showThanks = Boolean(sp.session_id);

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id, status: "paid" },
    orderBy: { updatedAt: "desc" },
    include: {
      lines: { include: { product: true } },
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <h1 className="page-title">买过的</h1>
      <p className="page-sub">付过钱的单子在这儿。Webhook 慢的话多刷两下。</p>

      {showThanks && (
        <p className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
          款应该到了。页面若没解锁，刷新或等几秒 Stripe 回调。
        </p>
      )}

      {orders.length === 0 ? (
        <div className="card mt-8 px-8 py-12 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            还没付过费的东西。
          </p>
          <Link href="/market" className="link-accent mt-3 inline-block text-sm">
            去市场转转
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <p className="text-xs text-zinc-500">
                {o.updatedAt.toLocaleString()} · {statusLabel[o.status]}
              </p>
              <ul className="mt-3 space-y-2">
                {o.lines.map((line) => (
                  <li key={line.id}>
                    <Link
                      href={`/p/${line.product.slug}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {line.product.title}
                    </Link>
                    <span className="ml-2 text-sm tabular-nums text-zinc-500">
                      {(line.priceCents / 100).toFixed(2)}{" "}
                      {o.currency.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
