import { DefaultNetwork } from 'config/config'
declare global {
  interface Window {
    ethereum: any
  }
}

interface Network {
  name: DefaultNetwork
  chainId: number
  rpcUrl: string
}

declare module globalThis {
  var arbitrum: string | undefined
  var arbitrumTestnet: string | undefined
  var development: string | undefined
  var defaultNetwork: Network = {}
  var autoSwitchNetwork: boolean
}

/* If your module exports nothing, you'll need this line. Otherwise, delete it */
export {}
