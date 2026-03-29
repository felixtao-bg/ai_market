"use client";

import { signIn } from "next-auth/react";

type Props = {
  hasGoogle: boolean;
  hasGitHub: boolean;
};

export function LoginButtons({ hasGoogle, hasGitHub }: Props) {
  if (!hasGoogle && !hasGitHub) {
    return (
      <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
        OAuth 还没配。打开{" "}
        <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/60">
          .env
        </code>{" "}
        填上{" "}
        <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/60">
          AUTH_GOOGLE_*
        </code>{" "}
        或{" "}
        <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/60">
          AUTH_GITHUB_*
        </code>
        ，别忘了 <code className="font-mono text-xs">AUTH_SECRET</code>。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {hasGoogle && (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/market" })}
          className="btn-secondary flex-1 border-zinc-200 sm:flex-initial"
        >
          Google 登录
        </button>
      )}
      {hasGitHub && (
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/market" })}
          className="btn-primary flex-1 sm:flex-initial"
        >
          GitHub 登录
        </button>
      )}
    </div>
  );
}
