import { ERC20__factory } from "@unicrowio/ethers-types";
import { ETH_ADDRESS } from "../helpers/constants";
import { ITokenInfo } from "../typing";
import { getJsonRpcProvider } from "./getJsonRpcProvider";
import { isSameAddress } from "../helpers";

const fetchTokenInfo = async (tokenAddress: string) => {
  const provider = await getJsonRpcProvider();
  const token = ERC20__factory.connect(tokenAddress, provider!);

  return Promise.all([token.symbol(), token.decimals()]).then((results) => ({
    tokenAddress,
    symbol: results[0],
    decimals: results[1],
  }));
};
/**
 * Gets info of an ERC20 token based on its address.
 *
 * @throws Error
 * If token info doesn't exist on this address or the token address couldn't be parsed.
 * @returns {Promise<ITokenInfo>}
 */
export const getTokenInfo = async (
  tokenAddress = ETH_ADDRESS,
): Promise<ITokenInfo> => {
  if (isSameAddress(tokenAddress, ETH_ADDRESS)) {
    return {
      address: tokenAddress,
      symbol: "ETH",
      decimals: 18,
    };
  }

  const storedValue = window.localStorage.getItem(tokenAddress);
  let tokenInfo: ITokenInfo | null = null;

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

  console.error(`Can't get token info from this address: ${tokenAddress}`);
  return null;
};
