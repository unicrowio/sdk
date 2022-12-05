import EventEmitter from 'events'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'

let currentWallet: string | null = null
let externalOnChangeWalletCallback:
  | ((walletAddress: string | null) => void)
  | null
let accountChangedListener: EventEmitter | null = null

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

    if (_accounts && _accounts.length > 0) {
      currentWallet = _accounts[0]
      return _accounts[0]
    }
    return null
  }

  return currentWallet
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

export const isListening = (): boolean => {
  return !!externalOnChangeWalletCallback
}

export const stopListening = () => {
  externalOnChangeWalletCallback = null
}

export const getWeb3Provider = async (): Promise<Web3Provider> => {
  const ethereum = checkIsWalletInstalled()

  await connect()

  return new ethers.providers.Web3Provider(
    ethereum as unknown as ExternalProvider
  )
}

export const getWalletAccount = async () => {
  await connect()
  return currentWallet
}
