import EventEmitter from 'events'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { networks, UnicrowNetwork } from './networks'
import { DefaultNetwork } from '../config/init'
import initNetworks from '../config/init'

let currentWallet: string | null = null
let accountChangedListener: EventEmitter | null = null
let chainChangedListener: EventEmitter | null = null
let _onChangeNetworkCallbacks: Array<(networkId: number) => void> = []
let _onChangeWalletCallbacks: Array<(currentWallet: string) => void> = []

const handleAccountsChanged = (accounts: string[]) => {
  if (currentWallet === accounts[0]) {
    return
  }

  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    currentWallet = null
  } else {
    currentWallet = accounts[0]
  }

  _onChangeWalletCallbacks.length > 0 &&
    _onChangeWalletCallbacks.forEach(
      (callback: (currentWallet: string) => void) => callback(currentWallet)
    )
}

const handleChainChanged = (networkId: number) => {
  _onChangeNetworkCallbacks.length > 0 &&
    _onChangeNetworkCallbacks.forEach((callback: (networkId: number) => void) =>
      callback(networkId)
    )
}

const registerChainChangedListener = () => {
  const ethereum = checkIsWalletInstalled()

  if (!chainChangedListener) {
    chainChangedListener = ethereum!.on('chainChanged', networkId => {
      console.info('chainChanged', networkId)
      handleChainChanged(networkId)
    })
  }
}

const registerAccountChangedListener = () => {
  const ethereum = checkIsWalletInstalled()

  if (!accountChangedListener) {
    accountChangedListener = ethereum!.on(
      'accountsChanged',
      (accounts: any) => {
        handleAccountsChanged(accounts)
      }
    )
  }
}

export const connect = async (): Promise<string | null> => {
  if (!currentWallet) {
    registerAccountChangedListener()

    const ethereum = checkIsWalletInstalled()
    const _accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    })

    handleAccountsChanged(_accounts)

    // true = forces switch to correct network even if network got configured to not autoswitch
    autoSwitchNetwork(true)

    if (_accounts && _accounts.length > 0) {
      currentWallet = _accounts[0]
      return _accounts[0]
    }
    return null
  }

  return currentWallet
}

export const switchNetwork = async (name: DefaultNetwork) => {
  const ethereum = checkIsWalletInstalled()
  const { chainName, rpcUrls, chainId, nativeCurrency } = networks[name]

  registerAccountChangedListener()

  const addParams: any = {
    chainId: ethers.utils.hexValue(chainId),
    chainName,
    rpcUrls,
    nativeCurrency
  }

  const switchParams: any = { chainId: addParams.chainId }

  /**
   * one could think that if one of the following two rpc methods fail, the code should continue within the catch blocks.
   * which of course it does, **but**: Metamask still throws an error in that situation. in order to prevent that,
   * we're calling both rpc methods in individual try-blocks instead of how it is described in their docs here:
   *
   * https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
   */
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [addParams]
    })
  } catch (addError) {
    console.log(addError)
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [switchParams]
    })
  } catch (switchError) {
    console.log(switchError)
  }

  const connected = await getNetwork()

  if (connected.chainId == chainId) {
    initNetworks({ defaultNetwork: name })
  }

  return name
}

export const autoSwitchNetwork = async (callbacks?, force?: boolean) => {
  if (!(await isCorrectNetworkConnected())) {
    if (force || globalThis.autoNetworkSwitch) {
      switchNetwork(globalThis.defaultNetwork.name)
      callbacks?.switchingNetwork && callbacks.switchingNetwork()
    } else {
      throw new Error('Wrong network')
    }
  }
}

export const getNetwork = async (): Promise<ethers.providers.Network> => {
  const provider = await getWeb3Provider()
  return provider.getNetwork()
}

export const getSupportedNetworks: () => {
  [name: string]: UnicrowNetwork
} = () => networks

export const isCorrectNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork()
  return network.chainId === globalThis.defaultNetwork.chainId
}

export const isSupportedNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork()
  const currentNetwork = Object.values(networks).filter(
    n => n.chainId === network.chainId
  )

  return currentNetwork.length > 0
}

export const startListening = (
  onChangeWalletCallback: (walletAddress: string | null) => void
) => {
  const ethereum = checkIsWalletInstalled()
  _onChangeWalletCallbacks.push(onChangeWalletCallback)

  registerAccountChangedListener()
}

export const startListeningNetwork = (
  onChangeNetworkCallback: (networkId: number) => void
) => {
  const ethereum = checkIsWalletInstalled()

  _onChangeNetworkCallbacks.push(onChangeNetworkCallback)
  registerChainChangedListener()
}

export const isListening = (): boolean => {
  return _onChangeWalletCallbacks.length > 0
}

export const stopListening = () => {
  _onChangeWalletCallbacks = []
}

export const getWeb3Provider = async (): Promise<Web3Provider> => {
  // TODO: merge this with checkIsWalletInstalled
  const ethereum = checkIsWalletInstalled()

  return new ethers.providers.Web3Provider(
    ethereum as unknown as ExternalProvider
  )
}

const checkIsWalletInstalled = () => {
  if (typeof window === 'undefined') {
    throw new Error('Should run through Browser')
  }
  // Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window

  if (!(ethereum && ethereum.isMetaMask)) {
    // is there a more agnostic way to check? I know otherwallets use isMetaMask too, but perhaps there are better flags
    throw new Error('Please Install a web3 browser wallet')
  }

  return ethereum
}

export const getWalletAccount = async () => {
  await connect()
  return currentWallet
}
