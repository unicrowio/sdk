import { networks } from "../wallet/networks";

export const getHost = (host = "default"): string => {
  if (host === "default") {
    return globalThis?.defaultNetwork?.rpcUrl || networks?.arbitrum?.rpcUrls[0];
  } else if (host === "mainnet") {
    return globalThis?.mainnetRPCUrl;
  }
};
