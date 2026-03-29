"use client";

import { useActionState, useMemo } from "react";
import type { Product } from "@prisma/client";
import type { ActionState } from "@/app/actions/products";
import { createProduct, updateProduct } from "@/app/actions/products";
import { tagsFromStored } from "@/lib/validation/product";

function FormFields({ product }: { product?: Product }) {
  const dist = (product?.distribution as Record<string, string> | null) ?? {};

  return (
    <>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          标题
        </span>
        <input
          name="title"
          required
          defaultValue={product?.title}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          描述
        </span>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={product?.description}
          className="input min-h-[140px] resize-y"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          类型
        </span>
        <select
          name="type"
          defaultValue={product?.type ?? "skill"}
          className="input"
        >
          <option value="skill">Skill</option>
          <option value="mcp">MCP</option>
          <option value="plugin">Plugin</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          标签（逗号分隔）
        </span>
        <input
          name="tags"
          defaultValue={
            product ? tagsFromStored(product.tags).join(", ") : undefined
          }
          placeholder="cursor, mcp"
          className="input"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            定价
          </span>
          <select
            name="pricingModel"
            defaultValue={product?.pricingModel ?? "free"}
            className="input"
          >
            <option value="free">免费</option>
            <option value="paid">付费（Stripe）</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            价格（分）/ 货币
          </span>
          <div className="flex gap-2">
            <input
              name="priceCents"
              type="number"
              min={0}
              defaultValue={product?.priceCents ?? 0}
              className="input flex-1"
            />
            <input
              name="currency"
              maxLength={3}
              defaultValue={product?.currency ?? "usd"}
              className="input w-24 uppercase"
            />
          </div>
        </label>
      </div>

      <fieldset className="card flex flex-col gap-4 border-dashed border-zinc-200/90 p-5 dark:border-zinc-700/90">
        <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          别人怎么拿到（只填链接，别写密钥）
        </legend>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">仓库 URL</span>
          <input
            name="repoUrl"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={dist.repoUrl}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">npm 包名</span>
          <input
            name="npmPackage"
            defaultValue={dist.npmPackage}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">文档 URL</span>
          <input
            name="docUrl"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={dist.docUrl}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">安装说明</span>
          <textarea
            name="installHint"
            rows={4}
            defaultValue={dist.installHint}
            className="input resize-y"
          />
        </label>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          状态
        </span>
        <select
          name="status"
          defaultValue={product?.status ?? "draft"}
          className="input"
        >
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="hidden">隐藏</option>
        </select>
      </label>
    </>
  );
}

export function ProductFormCreate() {
  const [state, formAction] = useActionState(createProduct, {} as ActionState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200">
          {state.error}
        </p>
      )}
      <FormFields />
      <button type="submit" className="btn-primary mt-1 w-fit">
        创建
      </button>
    </form>
  );
}

export function ProductFormEdit({ product }: { product: Product }) {
  const update = useMemo(
    () => updateProduct.bind(null, product.id),
    [product.id],
  );
  const [state, formAction] = useActionState(update, {} as ActionState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200">
          {state.error}
        </p>
      )}
      <FormFields product={product} />
      <button type="submit" className="btn-primary mt-1 w-fit">
        保存
      </button>
    </form>
  );
}
