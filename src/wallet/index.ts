import EventEmitter from 'events'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { networks } from './networks'
import { DefaultNetwork } from '../config/init'
import initNetworks from '../config/init'

let currentNetworkId: number | null = null
let currentWallet: string | null = null
let externalOnChangeWalletCallback:
  | ((walletAddress: string | null) => void)
  | null
let accountChangedListener: EventEmitter | null = null
let networkChangedListener: EventEmitter | null = null
let externalOnChangeNetworkCallback: ((network: number) => void) | null

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

  if (externalOnChangeWalletCallback) {
    externalOnChangeWalletCallback(currentWallet)
  }
}

const handleNetworkChanged = (networkId: number) => {
  if (currentNetworkId == networkId) {
    return
  }

  currentNetworkId = networkId

  if (externalOnChangeNetworkCallback) {
    externalOnChangeNetworkCallback(networkId)
  }
}

export const connect = async (): Promise<string | null> => {
  if (!currentWallet) {
    const ethereum = checkIsWalletInstalled()

    if (!accountChangedListener) {
      accountChangedListener = ethereum!.on(
        'accountsChanged',
        (accounts: any) => {
          handleAccountsChanged(accounts)
        }
      )
    }

    const _accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    })

    handleAccountsChanged(_accounts)
    // only switches automatically if 2 criterias are met:
    // 1) user has allowed Metamask already to let the page switch to Arbitrum
    // 2) the network got initialized with autoSwitchNetwork = true (src/config.index.ts)
    autoSwitchNetwork()

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

  if (!accountChangedListener) {
    accountChangedListener = ethereum!.on(
      'accountsChanged',
      (accounts: any) => {
        handleAccountsChanged(accounts)
      }
    )
  }

  const addParams: any = {
    chainId: ethers.utils.hexValue(Number(chainId)),
    chainName,
    rpcUrls,
    nativeCurrency
  }

  const switchParams: any = { chainId: addParams.chainId }

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

  if (connected.chainId == Number(chainId)) {
    initNetworks({ defaultNetwork: name })
  }

  return name
}

export const getNetwork = async (): Promise<ethers.providers.Network> => {
  const provider = await getWeb3Provider()
  return provider.getNetwork()
}

export const isCorrectNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork()
  return network.chainId === globalThis.defaultNetwork.chainId
}

export const autoSwitchNetwork = async (callbacks?) => {
  if (!(await isCorrectNetworkConnected())) {
    if (globalThis.autoNetworkSwitch) {
      callbacks?.switchingNetwork && callbacks.switchingNetwork()
      switchNetwork(globalThis.defaultNetwork.name)
    } else {
      throw new Error('Wrong network')
    }
  }
}

export const startListening = (
  onChangeWalletCallback: (walletAddress: string | null) => void
) => {
  const ethereum = checkIsWalletInstalled()

  if (!accountChangedListener) {
    accountChangedListener = ethereum!.on(
      'accountsChanged',
      (accounts: any) => {
        handleAccountsChanged(accounts)
      }
    )
  }

  externalOnChangeWalletCallback = onChangeWalletCallback
}

export const startListeningNetwork = (
  onChangeNetworkCallback: (network: number) => void
) => {
  const ethereum = checkIsWalletInstalled()

  if (!networkChangedListener) {
    networkChangedListener = ethereum!.on('networkChanged', networkId => {
      console.info('networkChanged', networkId)
      handleNetworkChanged(networkId)
    })
  }

  externalOnChangeNetworkCallback = onChangeNetworkCallback
}

export const isListening = (): boolean => {
  return !!externalOnChangeWalletCallback
}

export const stopListening = () => {
  externalOnChangeWalletCallback = null
}

export const getWeb3Provider = async (): Promise<Web3Provider> => {
  const ethereum = checkIsWalletInstalled()

  return new ethers.providers.Web3Provider(
    ethereum as unknown as ExternalProvider
  )
}

export const getWalletAccount = async () => {
  await connect()
  return currentWallet
}
