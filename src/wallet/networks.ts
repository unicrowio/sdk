const arbitrumRpcUrl = globalThis.arbitrum || 'https://arb1.arbitrum.io/rpc'
const arbitrumTestnetmRpcUrl =
  globalThis.arbitrumTestnet || 'https://goerli-rollup.arbitrum.io/rpc'
const developmentRpcUrl = globalThis.development || 'https://rpc-net.unicrow.io'

export const networks = {
  arbitrum: {
    chainId: '42161',
    chainName: 'Arbitrum One',
    displayName: 'Arbitrum',
    nativeCurrency: {
      name: 'Arbitrum Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [arbitrumRpcUrl],
    blockExplorerUrls: ['https://arbiscan.io/']
  },
  arbitrumTestnet: {
    chainId: '421613',
    chainName: 'Arbitrum Goerli',
    displayName: 'Arbitrum Testnet',
    nativeCurrency: {
      name: 'Arbitrum Görli Ether',
      symbol: 'AGOR',
      decimals: 18
    },
    rpcUrls: [arbitrumTestnetmRpcUrl],
    blockExplorerUrls: ['https://goerli-rollup-explorer.arbitrum.io']
  },
  development: {
    chainId: '5777',
    chainName: 'Unicrow Testnet',
    displayName: 'Unicrow Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [developmentRpcUrl]
  }
}
