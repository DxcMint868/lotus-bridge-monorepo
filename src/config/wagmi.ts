import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Lotus Bridge",
  projectId:
    import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID", // Get this from https://cloud.walletconnect.com
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(import.meta.env.DEV ? [sepolia, baseSepolia] : []),
  ],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
