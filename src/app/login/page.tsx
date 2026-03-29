import { redirect } from "next/navigation";
import { auth, isDevCredentialsEnabled } from "@/auth";
import { DevLoginForm } from "@/components/dev-login-form";
import { LoginButtons } from "@/components/login-buttons";
import { WalletLoginSection } from "@/components/wallet-login-section";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/market");
  }

  const hasGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const hasGitHub = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  const showDevLogin = isDevCredentialsEnabled();

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:py-20">
      <div className="card p-8 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          登录
        </h1>
        <p className="page-sub mt-2">
          {showDevLogin
            ? "开发环境可邮箱登录；也可用钱包签名（SIWE）。OAuth 见下方。"
            : "钱包、Google / GitHub 均可。我们不存密码与私钥，链上只验签名。"}
        </p>
        <div className="mt-8 space-y-8">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              加密钱包
            </p>
            <WalletLoginSection />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              社交账号
            </p>
            <LoginButtons hasGoogle={hasGoogle} hasGitHub={hasGitHub} />
          </div>
        </div>
        {showDevLogin && <DevLoginForm />}
      </div>
    </main>
  );
}
