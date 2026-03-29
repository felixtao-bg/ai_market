"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { getAddress, type Address } from "viem";

export function WalletLoginButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    if (!address || chainId === undefined) return;
    setPending(true);
    setError(null);
    try {
      let checksummed: Address;
      try {
        checksummed = getAddress(address);
      } catch {
        setError("无效的钱包地址");
        return;
      }

      const challengeRes = await fetch("/api/wallet/challenge", { method: "POST" });
      if (!challengeRes.ok) {
        setError("获取登录随机数失败");
        return;
      }
      const { nonce } = (await challengeRes.json()) as { nonce?: string };
      if (!nonce) {
        setError("无效的随机数响应");
        return;
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const host =
        typeof window !== "undefined" ? window.location.host : "";

      const siwe = new SiweMessage({
        domain: host,
        address: checksummed,
        /** EIP-4361：statement 须为可打印 ASCII */
        statement: "Sign in to AI Market.",
        uri: origin,
        version: "1",
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
      });

      const message = siwe.prepareMessage();
      const signature = await signMessageAsync({ message });

      const signInResult = await signIn("siwe", {
        message,
        signature,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("签名验证失败，请重试");
        return;
      }

      if (signInResult?.ok) {
        window.location.href = "/market";
        return;
      }

      setError("登录未完成");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/reject|denied|cancel/i.test(msg)) {
        setError("你取消了钱包签名");
      } else {
        setError(msg || "签名失败");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex w-full flex-col items-stretch gap-2">
        <ConnectButton showBalance={false} chainStatus="icon" />
        {isConnected && (
          <button
            type="button"
            onClick={onSignIn}
            disabled={pending || signing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 dark:border-violet-500/30"
          >
            <span aria-hidden className="text-base">
              ◈
            </span>
            {pending || signing ? "请在钱包中确认…" : "签名并登录"}
          </button>
        )}
      </div>
      <p className="text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        使用 RainbowKit 选择钱包（含 WalletConnect）；SIWE 签名说明为英文（协议要求
        ASCII），私钥不经过我们的服务器。
      </p>
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
