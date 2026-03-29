"use client";

import { SessionProvider } from "next-auth/react";
import { Web3Providers } from "@/components/web3-providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Web3Providers>{children}</Web3Providers>
    </SessionProvider>
  );
}
