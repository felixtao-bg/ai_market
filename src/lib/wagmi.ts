import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, polygon, sepolia } from "wagmi/chains";

/**
 * Reown / WalletConnect Cloud：https://cloud.reown.com
 * RainbowKit 要求非空 projectId；未配置时使用占位 hex，扫码钱包在生产环境请换成你在 Cloud 创建的项目 ID。
 */
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AI Market",
  projectId: walletConnectProjectId,
  chains: [mainnet, sepolia, base, arbitrum, polygon],
  ssr: true,
});
