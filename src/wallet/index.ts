import EventEmitter from "events";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { networks, UnicrowNetwork } from "./networks";
import { CHAIN_ID } from "../helpers";
import { DefaultNetwork, IGenericTransactionCallbacks } from "typing";
import { config } from "../config";

let walletAddress: string | null = null;
let accountChangedListener: EventEmitter | null = null;
let chainChangedListener: EventEmitter | null = null;
let _onChangeNetworkCallbacks: Array<(networkId: number) => void> = [];
let _onChangeWalletCallbacks: Array<(walletAddress: string) => void> = [];

const handleAccountsChanged = (accounts: string[]) => {
  if (walletAddress === accounts[0]) {
    return;
  }

  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    walletAddress = null;
  } else {
    walletAddress = accounts[0];
  }

  _onChangeWalletCallbacks.length > 0 &&
    _onChangeWalletCallbacks.forEach(
      (callback: (walletAddress: string) => void) => callback(walletAddress),
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
  if (!chainChangedListener) {
    chainChangedListener = window.ethereum.on("chainChanged", (networkId) => {
      console.info("chainChanged", networkId);
      handleChainChanged(networkId);
    });
  }
};

const registerAccountChangedListener = () => {
  if (!accountChangedListener) {
    accountChangedListener = window.ethereum.on(
      "accountsChanged",
      (accounts: any) => {
        handleAccountsChanged(accounts);
      },
    );
  }
};

/**
 * Connects user's web3 wallet
 *
 * @returns address of the connected account
 */
export const connect = async (): Promise<string | null> => {
  if (isWeb3WalletInstalled() && !walletAddress) {
    registerAccountChangedListener();

    const _accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    handleAccountsChanged(_accounts);

    if (_accounts && _accounts.length > 0) {
      walletAddress = _accounts[0];
      return _accounts[0];
    }
  } else {
    return null;
  }

  return walletAddress;
};

/**
 * Asks user's web3 wallet to switch to a selected network
 *
 * @param name - Name of one of the configured networks ('arbitrum', 'development', or 'goerli' in standard SDK installation)
 * @returns Name of the network that the wallet was switched to.
 * @throws Error if no wallet is present or the user rejected adding or switching to the network
 */
export const switchNetwork = async (name: DefaultNetwork) => {
  if (!isWeb3WalletInstalled()) return null;
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

/**
 * If non-default network is connected and if auto-switch is configured globally or requested by "force" parameter,
 * switch wallet to the default network
 *
 * @param force - True to force switching to the default network
 * @throws Unsupported network error if the user is on incorrect network, and neither global settings nor the parameter requires the switch
 */
export const autoSwitchNetwork = async (
  callbacks?: IGenericTransactionCallbacks,
  force: boolean = false,
) => {
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

/**
 * Get parameters of the network that the wallet is connected to
 *
 * @returns Network parameters
 */
export const getNetwork = async (): Promise<ethers.providers.Network> => {
  const provider = await getWeb3Provider();

  let network = {
    chainId: 0,
    name: "unknown",
  };

  if (provider !== null) {
    network = await provider.getNetwork();

    if (network.chainId === CHAIN_ID.development) {
      network = {
        ...network,
        name: "development",
      };
    }
  }

  return network;
};

/**
 * Get list of networks supported by the configuration
 *
 * @returns List and parameters of all configured networks
 */
export const getSupportedNetworks: () => {
  [name: string]: UnicrowNetwork;
} = () => networks;

/**
 * Checks, based on chainId comparison, if the wallet is connected to the default network
 *
 * @returns true/false if the wallet is connected to the default network
 */
export const isCorrectNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork();
  return network.chainId === globalThis.defaultNetwork.chainId;
};

/**
 * Checks, based on chainId comparison, if the wallet is connected to one of the networks supported by the configuration
 *
 * @returns true/false
 */
export const isSupportedNetworkConnected = async (): Promise<boolean> => {
  const network = await getNetwork();
  const currentNetwork = Object.values(networks).filter(
    (n) => n.chainId === network.chainId,
  );

  return currentNetwork.length > 0;
};

/**
 * Start listening to change in wallet connection and run the callback function if the account changes
 *
 * @param onChangeWalletCallback Function to be called if the user changes a connected account
 */
export const startListening = (
  onChangeWalletCallback: (walletAddress: string | null) => void,
) => {
  if (isWeb3WalletInstalled()) {
    _onChangeWalletCallbacks.push(onChangeWalletCallback);
    registerAccountChangedListener();
  }
};

/**
 * Listen to whether the wallet switches to another network and run the provided callback if yes
 *
 * @param onChangeNetworkCallback Function to be called when the wallet switches to another network
 */
export const startListeningNetwork = (
  onChangeNetworkCallback: (networkId: number) => void,
) => {
  if (isWeb3WalletInstalled()) {
    _onChangeNetworkCallbacks.push(onChangeNetworkCallback);
    registerChainChangedListener();
  }
};

/**
 * Check if the app is listening to account or network change
 *
 * @returns true if at least one of the listeners is active
 */
export const isListening = (): boolean => {
  return _onChangeWalletCallbacks.length > 0;
};

/**
 * Stop listening to wallet account changes
 */
export const stopListening = () => {
  _onChangeWalletCallbacks = [];
};

/**
 * Stop listening to network switch
 */
export const stopListeningNetwork = () => {
  _onChangeNetworkCallbacks = [];
};

export const getWeb3Provider = async (): Promise<Web3Provider> => {
  return isWeb3WalletInstalled()
    ? new ethers.providers.Web3Provider(
        window.ethereum as unknown as ExternalProvider,
        "any",
      )
    : null;
};

/**
 * Check if a web3 wallet is installed
 *
 * @returns boolean
 * @throws If this is not run in a browser
 */
export const isWeb3WalletInstalled = () => {
  if (typeof window === "undefined") {
    throw new Error("Should run through Browser");
  }

  return !!window?.ethereum?.isMetaMask;
};

/**
 * Returns connected wallet account (Attempts to connect to the wallet if not connected)
 * @returns Account address
 */
export const getCurrentWalletAddress = async () => {
  await connect();
  return walletAddress;
};
