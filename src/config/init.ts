import { networks as DefaultNetworks } from '../wallet/networks'

export type DefaultNetwork = 'arbitrum' | 'arbitrumTestnet' | 'development'

type Network = {
  rpcUrl: string
}

type Networks = {
  [key in DefaultNetwork]?: Network
}

interface IConfig {
  networks?: Networks
  defaultNetwork?: DefaultNetwork
  autoSwitchNetwork?: boolean
}

function initNetworks({
  networks,
  defaultNetwork = 'arbitrum',
  autoSwitchNetwork = false
}: IConfig) {
  const fallbacks = {
    arbitrum: networks?.arbitrum?.rpcUrl || process.env.ARBITRUM_RPC_URL,
    arbitrumTestnet:
      networks?.arbitrumTestnet?.rpcUrl || process.env.ARBITRUM_TESTNET_RPC_URL,
    development:
      networks?.development?.rpcUrl || process.env.DEVELOPMENT_RPC_URL
  }

  if (networks?.arbitrum)
    globalThis.arbitrum = globalThis.arbitrum || fallbacks.arbitrum
  if (networks?.arbitrumTestnet)
    globalThis.arbitrumTestnet =
      globalThis.arbitrumTestnet || fallbacks.arbitrumTestnet
  if (networks?.development)
    globalThis.development = globalThis.development || fallbacks.development

  globalThis.defaultNetwork = {
    name: defaultNetwork || DefaultNetworks[defaultNetwork]?.chainName,
    displayName:
      DefaultNetworks[defaultNetwork]?.displayName ||
      DefaultNetworks.arbitrum?.displayName,
    chainId: defaultNetwork
      ? Number(DefaultNetworks[defaultNetwork].chainId)
      : Number(DefaultNetworks.arbitrum.chainId),
    rpcUrl: defaultNetwork
      ? DefaultNetworks[defaultNetwork]?.rpcUrls[0]
      : DefaultNetworks.arbitrum?.rpcUrls[0]
  }

  globalThis.autoSwitchNetwork = autoSwitchNetwork
}

export default initNetworks
