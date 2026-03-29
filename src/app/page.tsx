import Link from "next/link";
import { listHotSkills } from "@/lib/products-query";

export default async function HomePage() {
  let hotSkills: Awaited<ReturnType<typeof listHotSkills>> = [];
  let dbUnavailable = false;
  try {
    hotSkills = await listHotSkills(8);
  } catch {
    dbUnavailable = true;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Skill · MCP · 小插件
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl sm:leading-tight dark:text-zinc-50">
            一个小集市，
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              用来找东西、挂东西
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            想装个 MCP、扒个 Skill，可以来翻一翻。手上有成品也可以丢上来。收费的话走
            Stripe，密钥你自己配，我们不插手你的账本。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/market" className="btn-primary">
              去市场逛逛
            </Link>
            <Link href="/market?sort=hot" className="btn-secondary">
              热度榜
            </Link>
            <Link href="/login" className="btn-secondary">
              登录
            </Link>
            <Link href="/dashboard/products" className="btn-secondary">
              我上架的
            </Link>
          </div>

          <ul className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { t: "搜得到", d: "标题、描述、标签都能搜，凑合够用。" },
              { t: "写清楚", d: "仓库、npm、文档链接摆好，别人少踩坑。" },
              { t: "热度", d: "详情页每开一次算一次浏览，按次数排行。" },
            ].map((item) => (
              <li
                key={item.t}
                className="card rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800/80"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.t}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.d}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="mt-14 lg:mt-0">
          <div className="card sticky top-20 p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Skill 热度
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              按浏览次数，只含已发布 Skill。
            </p>
            <ol className="mt-4 space-y-2.5">
              {dbUnavailable ? (
                <li className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                  数据库连不上（例如本机需先{" "}
                  <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900/60">
                    docker compose up -d
                  </code>{" "}
                  再{" "}
                  <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900/60">
                    pnpm exec prisma migrate deploy
                  </code>
                  ）。也可用 Neon 的{" "}
                  <code className="font-mono">DATABASE_URL</code> 写进{" "}
                  <code className="font-mono">.env</code>。
                </li>
              ) : hotSkills.length === 0 ? (
                <li className="text-xs text-zinc-500">
                  暂无数据。运行{" "}
                  <code className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">
                    npx prisma db seed
                  </code>{" "}
                  导入本机 Cursor skills。
                </li>
              ) : (
                hotSkills.map((s, i) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="w-4 shrink-0 tabular-nums text-xs text-zinc-400">
                        {i + 1}
                      </span>
                      <Link
                        href={`/p/${s.slug}`}
                        className="truncate font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {s.title}
                      </Link>
                    </span>
                    <span className="shrink-0 tabular-nums text-xs text-zinc-400">
                      {s.viewCount}
                    </span>
                  </li>
                ))
              )}
            </ol>
            <Link
              href="/market?type=skill&sort=hot"
              className="link-accent mt-4 inline-block text-xs"
            >
              全部 Skill 热度 →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
