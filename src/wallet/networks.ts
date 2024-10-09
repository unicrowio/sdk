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
      name: "Arbitrum Ether",
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
      name: "Arbitrum Sepolia Ether",
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
      name: "Base",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org/"],
  },
};
