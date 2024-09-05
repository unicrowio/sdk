export interface UnicrowNetwork {
  chainId: bigint;
  chainName: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
  addresses: {
    unicrow: string;
    dispute: string;
    arbitrator: string;
    claim: string;
  };
  live: boolean;
}

export const networks: UnicrowNetwork[] = [
  {
    chainId: BigInt(42161),
    chainName: "Arbitrum One",
    displayName: "Arbitrum",
    nativeCurrency: {
      name: "Arbitrum Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
    addresses: {
      unicrow: "0x24e9ECC6c56dcD0C875fDF181FA3A4EEf3c5D5F0",
      dispute: "0xab32831aA9bBFEB12F1BA7B74eBFf76e45944937",
      arbitrator: "0xF1447b0fda912a6857B5d77d7cDE9663266896cf",
      claim: "0x40F83551803051676eB7Cb0374176d03db247b97",
    },
    live: true,
  },
  {
    chainId: BigInt(1),
    chainName: "Ethereum",
    displayName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io/"],
    // TODO - Update after deployment
    addresses: {
      unicrow: "",
      dispute: "",
      arbitrator: "",
      claim: "",
    },
    live: false,
  },
  {
    chainId: BigInt(421614),
    chainName: "Arbitrum Sepolia Testnet",
    displayName: "Arbitrum Sepolia Testnet",
    nativeCurrency: {
      name: "Arbitrum Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    addresses: {
      unicrow: "0x0fD5d4bbdf522E5daA11dcd6557D542c4573011B",
      dispute: "0x0BBc45602129cc57ED70d11a2B8a0e160700C7dB",
      arbitrator: "0x41415F717351A22DeBD6B3E7382D0BCf74201B8a",
      claim: "0x67dBfb5117296a354B464f4591Da570cA96Bc4Fb",
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
    live: true,
  },
  {
    chainId: BigInt(11155111),
    chainName: "Ethereum Sepolia Testnet",
    displayName: "Ehereum Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    addresses: {
      unicrow: "0xEC8eaCfC2Dd1614b7182676A118088a204F69b86",
      dispute: "0x335ba877387646815cb189f9883dF98aa0913EAF",
      arbitrator: "0x310Da0C6c224C14168e7bBEd632797A79B9eff95",
      claim: "0xAF6eC0acE0Ac7CB7865313523cAE83Cfaaa788e0",
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    live: true,
  },
];
