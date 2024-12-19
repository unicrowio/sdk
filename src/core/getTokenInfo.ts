import { ethers } from "ethers";
import { ERC20__factory } from "@unicrowio/ethers-types";
import { isSameAddress } from "../helpers";
import { IToken } from "../typing";
import { autoSwitchNetwork } from "../wallet";
import { getBrowserProvider } from "./internal/getBrowserProvider";

const fetchTokenInfo = async (tokenAddress: string) => {
  try {
    await autoSwitchNetwork();
    const token = ERC20__factory.connect(tokenAddress, getBrowserProvider());
    return Promise.all([token.symbol(), token.decimals()]).then((results) => ({
      address: tokenAddress,
      symbol: results[0],
      decimals: Number(results[1]),
    }));
  } catch (e) {
    console.error("Error fetching token information", e);
  }
};

/**
 * Gets info of an ERC20 token based on its address.
 *
 * @param tokenAddress Address of the token on Arbitrum One blockchain
 * @throws Error if token info doesn't exist on this address or the token address couldn't be parsed.
 * @returns Token address, symbol, and no. of its decimals
 */
export const getTokenInfo = async (
  tokenAddress = ethers.ZeroAddress,
): Promise<IToken> => {
  if (isSameAddress(tokenAddress, ethers.ZeroAddress)) {
    return {
      address: tokenAddress,
      symbol: "ETH",
      decimals: 18,
    };
  }

  const storedValue = window.localStorage.getItem(tokenAddress);
  let tokenInfo: IToken | null = null;

  // There was some value stored
  if (storedValue) {
    try {
      return JSON.parse(storedValue);
      // In case of stored value be invalid JSON
    } catch (e) {
      console.error(e);
    }
  }

  console.info("fetching new information");
  tokenInfo = await fetchTokenInfo(tokenAddress);

  if (tokenInfo) {
    window.localStorage.setItem(tokenAddress, JSON.stringify(tokenInfo));
    return tokenInfo;
  }

  console.error(`Can't get info from tokenAddress: ${tokenAddress}`);
  return null;
};
