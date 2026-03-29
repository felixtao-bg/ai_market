import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";
import prisma from "@/lib/prisma";

/** 仅当环境变量齐全时启用，用于登录页按钮与真实 OAuth */
const configuredOAuth = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  configuredOAuth.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  configuredOAuth.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

const hasConfiguredOAuth = configuredOAuth.length > 0;

const useDevCredentials =
  !hasConfiguredOAuth &&
  process.env.NODE_ENV === "development" &&
  process.env.AUTH_DEV_LOGIN === "1";

const credentialsProvider = Credentials({
  id: "credentials",
  name: "Dev email",
  credentials: {
    email: { label: "Email", type: "email" },
  },
  async authorize(creds) {
    const email = (creds?.email as string | undefined)?.trim().toLowerCase();
    if (!email || !email.includes("@")) return null;
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name: email.split("@")[0] ?? "User" },
      update: {},
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});

/** SIWE：MetaMask / OKX / Rabby 等 EIP-1193 扩展 */
const siweProvider = Credentials({
  id: "siwe",
  name: "Ethereum Wallet",
  credentials: {
    message: { label: "Message", type: "text" },
    signature: { label: "Signature", type: "text" },
  },
  async authorize(credentials) {
    const messageStr = credentials?.message as string | undefined;
    const signature = credentials?.signature as string | undefined;
    if (!messageStr?.trim() || !signature?.trim()) return null;

    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(messageStr);
    } catch {
      return null;
    }

    const nonce = siweMessage.nonce;
    const row = await prisma.siweChallenge.findUnique({
      where: { nonce },
    });
    if (!row || row.expiresAt < new Date()) return null;

    try {
      const result = await siweMessage.verify({
        signature,
        nonce,
      });
      if (!result.success) return null;
    } catch {
      return null;
    }

    await prisma.siweChallenge.delete({ where: { nonce } }).catch(() => {});

    let walletAddress: string;
    try {
      walletAddress = getAddress(
        siweMessage.address as `0x${string}`,
      ).toLowerCase();
    } catch {
      return null;
    }

    const short = `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
    const user = await prisma.user.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        name: short,
      },
      update: {
        name: short,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? short,
      image: user.image,
    };
  },
});

/**
 * `next build` 时 NODE_ENV=production 且无 OAuth：NextAuth 要求至少一个 provider。
 * 占位 GitHub 不会在登录页展示（LoginButtons 仍看真实 env），仅用于满足初始化。
 */
const placeholderProvider = GitHub({
  clientId: "placeholder-not-configured",
  clientSecret: "placeholder-not-configured",
});

const providers = useDevCredentials
  ? [credentialsProvider, siweProvider]
  : hasConfiguredOAuth
    ? [...configuredOAuth, siweProvider]
    : [placeholderProvider, siweProvider];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: useDevCredentials ? undefined : PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: useDevCredentials ? "jwt" : "database" },
  providers,
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (!session.user) return session;
      if (useDevCredentials && token?.sub) {
        session.user.id = token.sub;
      } else if (user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export function isDevCredentialsEnabled(): boolean {
  return useDevCredentials;
}
