import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";

export async function SiteHeader() {
  const session = await auth();

  const navLink =
    "rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/75 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/75">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-14">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/30"
            aria-hidden
          >
            AI
          </span>
          <span className="hidden sm:inline">Market</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/market" className={navLink}>
            市场
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard/products" className={navLink}>
                我的产品
              </Link>
              <Link href="/dashboard/purchases" className={`${navLink} hidden sm:inline-flex`}>
                购买记录
              </Link>
              <span className="hidden max-w-[9rem] truncate text-xs text-zinc-400 dark:text-zinc-500 md:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form action={signOutAction} className="inline">
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary !py-2 !text-xs sm:!text-sm">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
