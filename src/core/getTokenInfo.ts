import { ethers } from "ethers";
import { ERC20__factory } from "@unicrowio/ethers-types";
import { isSameAddress } from "../helpers";
import { IToken } from "../typing";
import { autoSwitchNetwork, getNetwork } from "../wallet";
import { getBrowserProvider } from "./internal/getBrowserProvider";

const fetchTokenInfo = async (tokenAddress: string) => {
  try {
    // Tether changed the name of USDT to USD₮0 on Arbitrum. It doesn't look great and we're sure will be confusing for users.
    // We're (for now) hardcoding this to at least drop the zero at the end (we'll respect Tether's wish to keep the ₮ character)
    // The reason we're doing the comparison this way (address + symbol) is to ensure this is USD₮0 on Arbitrum without having the network
    // information available here
    console.log("fetching");
    if (
      isSameAddress(
        tokenAddress,
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      ) &&
      (await getNetwork()).chainId == BigInt(42161)
    ) {
      return {
        address: tokenAddress,
        symbol: "USD₮",
        decimals: 6,
      };
    }

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

  tokenInfo = await fetchTokenInfo(tokenAddress);

  if (tokenInfo) {
    window.localStorage.setItem(tokenAddress, JSON.stringify(tokenInfo));
    return tokenInfo;
  }

  console.error(`Can't get info from tokenAddress: ${tokenAddress}`);
  return null;
};
