import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductFormEdit } from "@/components/product-form";
import prisma from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.ownerId !== session.user.id) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <Link
        href="/dashboard/products"
        className="text-sm text-zinc-500 transition hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        ← 返回列表
      </Link>
      <h1 className="mt-4 page-title">编辑</h1>
      <p className="mt-1 font-mono text-xs text-zinc-500">
        slug：{product.slug}（创建后不能改）
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <ProductFormEdit product={product} />
      </div>
    </main>
  );
}
