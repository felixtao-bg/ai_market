import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Market — Skill & MCP 市场",
    template: "%s · AI Market",
  },
  description: "找 Skill、逛 MCP，也能自己上架。工具向的小集市。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hans"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-app min-h-full flex flex-col text-zinc-900 dark:text-zinc-50">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-zinc-200/80 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4">
              <span className="text-zinc-400 dark:text-zinc-600">AI Market</span>
              <a href="/terms" className="link-accent text-xs font-normal">
                服务条款
              </a>
              <a href="/privacy" className="link-accent text-xs font-normal">
                隐私政策
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
