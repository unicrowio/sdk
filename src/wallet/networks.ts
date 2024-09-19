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
  mainnet: {
    chainId: CHAIN_ID.mainnet,
    chainName: "mainnet",
    displayName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io/"],
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
