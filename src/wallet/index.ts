import EventEmitter from "events";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { networks, UnicrowNetwork } from "./networks";
import config, { DefaultNetwork } from "../config/setup";
import { CHAIN_ID } from "../helpers";

let currentWallet: string | null = null;
let accountChangedListener: EventEmitter | null = null;
let chainChangedListener: EventEmitter | null = null;
let _onChangeNetworkCallbacks: Array<(networkId: number) => void> = [];
let _onChangeWalletCallbacks: Array<(currentWallet: string) => void> = [];

const handleAccountsChanged = (accounts: string[]) => {
  if (currentWallet === accounts[0]) {
    return;
  }

  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    currentWallet = null;
  } else {
    currentWallet = accounts[0];
  }

  _onChangeWalletCallbacks.length > 0 &&
    _onChangeWalletCallbacks.forEach(
      (callback: (currentWallet: string) => void) => callback(currentWallet),
    );
};

const handleChainChanged = (networkId: string) => {
  const _networkId = Number(networkId);

  _onChangeNetworkCallbacks.length > 0 &&
    _onChangeNetworkCallbacks.forEach(
      (callback: (networkId: number) => void) => callback(_networkId),
    );
};

const registerChainChangedListener = () => {
  const ethereum = checkIsWalletInstalled();

  if (ethereum && !chainChangedListener) {
    chainChangedListener = ethereum!.on("chainChanged", (networkId) => {
      console.info("chainChanged", networkId);
      handleChainChanged(networkId);
    });
  }
};

const registerAccountChangedListener = () => {
  const ethereum = checkIsWalletInstalled();

  if (ethereum && !accountChangedListener) {
    accountChangedListener = ethereum!.on(
      "accountsChanged",
      (accounts: any) => {
        handleAccountsChanged(accounts);
      },
    );
  }
};

export const connect = async (): Promise<string | null> => {
  if (!currentWallet) {
    registerAccountChangedListener();

    const ethereum = checkIsWalletInstalled();
    if (!ethereum) return null;
    const _accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    handleAccountsChanged(_accounts);

    if (_accounts && _accounts.length > 0) {
      currentWallet = _accounts[0];
      return _accounts[0];
    }
    return null;
  }

  return currentWallet;
};

export const switchNetwork = async (name: DefaultNetwork) => {
  checkIsWalletInstalled();
  const { chainName, rpcUrls, chainId, nativeCurrency, blockExplorerUrls } =
    networks[name];

  registerAccountChangedListener();

  const addParams: any = {
    chainId: ethers.utils.hexValue(chainId),
    chainName,
    rpcUrls,
    nativeCurrency,
    blockExplorerUrls,
  };

  const switchParams: any = { chainId: addParams.chainId };

  /**
   * one could think that if one of the following two rpc methods fail, the code should continue within the catch blocks.
   * which of course it does, **but**: Metamask still throws an error in that situation. in order to prevent that,
   * we're calling both rpc methods in individual try-blocks instead of how it is described in their docs here:
   *
   * https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
   */
  try {
    // check if the chain to connect to is installed
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [switchParams], // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    // if it is not, then install it into the user MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [addParams],
        });
      } catch (addError) {
        throw new Error("User rejected network addition");
      }
    }

    throw new Error("User rejected network switch");
  }

  const connected = await getNetwork();

  if (connected.chainId === chainId) {
    config({ defaultNetwork: name });
  }

  return name;
};

export const autoSwitchNetwork = async (callbacks?, force: boolean = false) => {
  const isCorrectNetwork = await isCorrectNetworkConnected();

  if (!isCorrectNetwork) {
    if (globalThis.autoSwitchNetwork || force) {
      await switchNetwork(globalThis.defaultNetwork.name);
      callbacks && callbacks.switchingNetwork && callbacks.switchingNetwork();
    } else {
      throw new Error("Unsupported network");
    }
  }
};

export const getNetwork = async (): Promise<ethers.providers.Network> => {
  const provider = await getWeb3Provider();

  if (provider === null) {
    return {
      chainId: 0,
      name: "unknown",
    };
  }

  let network = await provider.getNetwork();

  if (network.chainId === CHAIN_ID.development) {
    network = {
      ...network,
      name: "development",
    };
  }

  return network;
};

export const getSupportedNetworks: () => {
  [name: string]: UnicrowNetwork;
} = () => networks;

export const isCorrectNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork();
  return network.chainId === globalThis.defaultNetwork.chainId;
};

export const isSupportedNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork();
  const currentNetwork = Object.values(networks).filter(
    (n) => n.chainId === network.chainId,
  );

  return currentNetwork.length > 0;
};

export const startListening = (
  onChangeWalletCallback: (walletAddress: string | null) => void,
) => {
  checkIsWalletInstalled();
  _onChangeWalletCallbacks.push(onChangeWalletCallback);

  registerAccountChangedListener();
};

export const startListeningNetwork = (
  onChangeNetworkCallback: (networkId: number) => void,
) => {
  _onChangeNetworkCallbacks.push(onChangeNetworkCallback);
  registerChainChangedListener();
};

export const isListening = (): boolean => {
  return _onChangeWalletCallbacks.length > 0;
};

export const stopListening = () => {
  _onChangeWalletCallbacks = [];
};

export const getWeb3Provider = async (): Promise<Web3Provider> => {
  // TODO: merge this with checkIsWalletInstalled
  const ethereum = checkIsWalletInstalled();

  return ethereum
    ? new ethers.providers.Web3Provider(
        ethereum as unknown as ExternalProvider,
        "any",
      )
    : null;
};

const checkIsWalletInstalled = () => {
  if (typeof window === "undefined") {
    throw new Error("Should run through Browser");
  }
  // Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;

  try {
    // is there a more agnostic way to check? I know otherwallets use isMetaMask too, but perhaps there are better flags
    const check = ethereum.isMetaMask;
  } catch (e) {
    return null;
  }

  return ethereum;
};

export const getWalletAccount = async () => {
  await connect();
  return currentWallet;
};
