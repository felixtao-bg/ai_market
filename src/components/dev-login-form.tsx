"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function DevLoginForm() {
  const [email, setEmail] = useState("demo@local.test");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        redirect: false,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.ok) {
        window.location.href = "/market";
      }
    } catch {
      setError("登录失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 dark:border-zinc-600 dark:bg-zinc-900/50"
    >
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        本地专用：随便填个邮箱就能进，不用 OAuth。上线务必关掉{" "}
        <code className="rounded bg-white px-1 font-mono text-[11px] dark:bg-zinc-800">
          AUTH_DEV_LOGIN
        </code>
        。
      </p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          邮箱
        </span>
        <input
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
          className="input"
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-secondary w-full">
        {pending ? "进…" : "开发环境进入"}
      </button>
    </form>
  );
}
