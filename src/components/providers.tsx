"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

/** WalletConnect / wagmi 依赖浏览器 API（如 indexedDB），禁止 SSR 预渲染 */
const Web3Providers = dynamic(
  () =>
    import("@/components/web3-providers").then((m) => m.Web3Providers),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Web3Providers>{children}</Web3Providers>
    </SessionProvider>
  );
}
