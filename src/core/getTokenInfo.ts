import { ERC20__factory } from "@unicrowio/ethers-types";
import { ETH_ADDRESS, isSameAddress } from "../helpers";
import { IToken } from "../typing";
import { getJsonRpcProvider } from "./internal/getJsonRpcProvider";

interface ITokenWithName extends IToken {
  name?: string;
}

const fetchTokenInfo = async (tokenAddress: string, withName?: boolean) => {
  const provider = getJsonRpcProvider();
  const token = ERC20__factory.connect(tokenAddress, provider!);

  try {
    await token.symbol();
    const promises = [token.symbol(), token.decimals()];
    return Promise.all(withName ? [...promises, token.name()] : promises).then(
      (results) => {
        const [symbol, decimals] = results;
        const result = {
          address: tokenAddress,
          symbol,
          decimals,
        };

        if (withName) {
          const name = results[3];
          return {
            ...result,
            name,
          } as ITokenWithName;
        }

        return result as IToken;
      },
    );
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
  withName?: boolean,
): Promise<IToken | ITokenWithName> => {
  if (isSameAddress(tokenAddress, ETH_ADDRESS)) {
    return {
      address: tokenAddress,
      symbol: "ETH",
      decimals: 18,
    };
  }

  const storedValue = window.localStorage.getItem(tokenAddress);
  let tokenInfo: IToken | ITokenWithName = null;

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
  tokenInfo = await fetchTokenInfo(tokenAddress, withName);

  if (tokenInfo) {
    window.localStorage.setItem(tokenAddress, JSON.stringify(tokenInfo));
    return tokenInfo;
  }

  console.error(`Can't get info from tokenAddress: ${tokenAddress}`);
  return null;
};
