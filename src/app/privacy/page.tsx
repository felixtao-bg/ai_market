export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 sm:py-16">
      <div className="card p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          隐私政策（占位）
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          同样是占位。登录走 Google/GitHub 时，他们会按自己的政策处理你的账号信息；我们可能看到邮箱、昵称、头像之类公开资料。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          使用「以太坊钱包登录」时，我们会在数据库中保存你的钱包地址（小写）用于识别账号，不保存私钥；登录通过 SIWE
          链下签名验证完成。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          付钱走 Stripe，卡号我们不碰，细节看 Stripe 的说明。正式运营前把这页写完整。
        </p>
      </div>
    </main>
  );
}
