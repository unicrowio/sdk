import { ethers } from "ethers";

export const ADDRESS_ZERO = ethers.ZeroAddress;
export const MAX_UINT256 = ethers.MaxUint256;
export const ONE_DAY_IN_SEC = 86400;

export const ZERO_FEE_VALUE = 0;

export const ETH_ADDRESS = ADDRESS_ZERO;

export enum consensus {
  BUYER,
  SELLER,
}

// TODO: It was copied from contract but should be accessed directly to prevent errors
export const WHO_PROTOCOL = 0;
export const WHO_BUYER = 1;
export const WHO_SELLER = 2;
export const WHO_MARKETPLACE = 3;

export enum split {
  BUYER,
  SELLER,
  MARKETPLACE,
  CROW,
  DEV,
}

export const BUYER = "buyer";
export const SELLER = "seller";

export const CHAIN_ID = {
  arbitrumOne: BigInt(42161),
  mainnet: BigInt(1),
  development: BigInt(5777),
  arbitrumSepolia: BigInt(421614),
};

export const metamaskUrl = "https://metamask.io/download/";
