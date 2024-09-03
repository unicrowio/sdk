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
    chainName: "Arbitrum One",
    displayName: "Arbitrum",
    nativeCurrency: {
      name: "Arbitrum Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
  mainnet: {
    chainId: CHAIN_ID.mainnet,
    chainName: "Ethereum",
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
    chainName: "Arbitrum Sepolia Testnet",
    displayName: "Arbitrum Sepolia Testnet",
    nativeCurrency: {
      name: "Arbitrum Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
  },
  sepolia: {
    chainId: CHAIN_ID.sepolia,
    chainName: "Ethereum Sepolia Testnet",
    displayName: "Ehereum Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
  goerli: {
    chainId: CHAIN_ID.goerli,
    chainName: "Goerli",
    displayName: "Ethereum Goerli Testnet",
    nativeCurrency: {
      name: "Görli Ether",
      symbol: "ETH",
      decimals: 18,
    },
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
  },
};
