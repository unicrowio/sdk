import { ERC20__factory } from "@unicrowio/ethers-types";
import { toast } from "ui/internal/notification/toast";
import { ETH_ADDRESS, isSameAddress } from "../helpers";
import { IToken } from "../typing";
import { getJsonRpcProvider } from "./internal/getJsonRpcProvider";

const fetchTokenInfo = async (tokenAddress: string) => {
  const provider = getJsonRpcProvider();
  const token = ERC20__factory.connect(tokenAddress, provider!);

  try {
    await token.name();
    return Promise.all([token.symbol(), token.decimals()]).then((results) => ({
      address: tokenAddress,
      symbol: results[0],
      decimals: results[1],
    }));
  } catch (e) {
    console.error(e);
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
  tokenAddress = ETH_ADDRESS,
): Promise<IToken> => {
  if (isSameAddress(tokenAddress, ETH_ADDRESS)) {
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

  toast.error(`Can't get info from tokenAddress: ${tokenAddress}`);
  return null;
};
