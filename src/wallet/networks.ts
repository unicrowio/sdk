import { CHAIN_ID } from "../helpers";

export interface UnicrowNetwork {
  chainId: bigint;
  chainName: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

export const networks: { [name: string]: UnicrowNetwork } = {
  arbitrum: {
    chainId: CHAIN_ID.arbitrumOne,
    chainName: "arbitrum",
    displayName: "Arbitrum One",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
  arbitrumSepolia: {
    chainId: CHAIN_ID.arbitrumSepolia,
    chainName: "arbitrumSepolia",
    displayName: "Arbitrum Sepolia Testnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
  },
  base: {
    chainId: CHAIN_ID.base,
    chainName: "base",
    displayName: "Base Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org/"],
  },
  baseSepolia: {
    chainId: CHAIN_ID.baseSepolia,
    chainName: "baseSepolia",
    displayName: "Base Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
  },
  development: {
    chainId: CHAIN_ID.development,
    chainName: "development",
    displayName: "Development (hardhat)",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
};
