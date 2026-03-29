import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 避免上层目录存在其他 lockfile 时被误判为 monorepo 根目录 */
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  /** MetaMask SDK / WalletConnect 的可选依赖，浏览器端不需要 */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
