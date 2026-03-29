import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductFormCreate } from "@/components/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <Link
        href="/dashboard/products"
        className="text-sm text-zinc-500 transition hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        ← 返回列表
      </Link>
      <h1 className="mt-4 page-title">新建</h1>
      <p className="page-sub">写清楚别人少私信你。</p>
      <div className="card mt-8 p-6 sm:p-8">
        <ProductFormCreate />
      </div>
    </main>
  );
}
