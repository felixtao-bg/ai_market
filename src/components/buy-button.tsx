"use client";

import { useState } from "react";

type Props = {
  productId: string;
};

export function BuyButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "结账失败");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("没拿到支付链接");
    } catch {
      setError("网络断了或服务器没应");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="btn-primary disabled:opacity-60"
      >
        {loading ? "跳转到 Stripe…" : "用 Stripe 付"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
