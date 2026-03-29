"use client";

import dynamic from "next/dynamic";

const WalletLoginButton = dynamic(
  () =>
    import("@/components/wallet-login-button").then((m) => m.WalletLoginButton),
  {
    ssr: false,
    loading: () => (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">加载钱包组件…</p>
    ),
  },
);

export function WalletLoginSection() {
  return <WalletLoginButton />;
}
