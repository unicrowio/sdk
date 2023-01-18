import { CHAIN_ID } from "../helpers";
const arbitrumRpcUrl = globalThis.arbitrum || "https://arb1.arbitrum.io/rpc";
const arbitrumTestnetmRpcUrl =
  globalThis.goerli || "https://goerli-rollup.arbitrum.io/rpc";
const developmentRpcUrl =
  globalThis.development || "https://rpc-net.unicrow.io";

export interface UnicrowNetwork {
  chainId: number;
  chainName: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

export const networks: { [name: string]: UnicrowNetwork } = {
  arbitrum: {
    chainId: CHAIN_ID.arbitrumOne,
    chainName: "Arbitrum One",
    displayName: "Arbitrum",
    nativeCurrency: {
      name: "Arbitrum Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [arbitrumRpcUrl],
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
  goerli: {
    chainId: CHAIN_ID.goerli,
    chainName: "Goerli",
    displayName: "Ethereum Goerli",
    nativeCurrency: {
      name: "Görli Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [arbitrumTestnetmRpcUrl],
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },
  development: {
    chainId: CHAIN_ID.development,
    chainName: "Unicrow Testnet",
    displayName: "Unicrow Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [developmentRpcUrl],
  },
};
