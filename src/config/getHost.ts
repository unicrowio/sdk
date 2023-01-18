import { networks } from "../wallet/networks";

const quiknodeUnicrowUrl =
  "https://purple-distinguished-vineyard.quiknode.pro/360bd2d54ace2ca5b775f1bf8325875fcd77204f/";

export const getHost = (host = "default"): string => {
  if (host === "default") {
    return globalThis?.defaultNetwork?.rpcUrl || networks?.arbitrum?.rpcUrls[0];
  } else if (host === "mainnet") {
    return globalThis?.mainnetRPCUrl || quiknodeUnicrowUrl;
  }
};
