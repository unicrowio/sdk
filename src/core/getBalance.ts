import { ERC20__factory } from "@unicrowio/ethers-types";
import {
  getWeb3Provider,
  getCurrentWalletAddress,
  autoSwitchNetwork,
} from "../wallet";
import { ETH_ADDRESS } from "../helpers";

/**
 * Checks if the user has the funds to pay for the given amount of tokens.
 * This function should be called only to verify the users' balance of ERC20 tokens.
 *
 * @param tokenAddress - Address of the token to check the user's balance of. (null for ETH)
 * @returns User's balance as BigInt of the given ETH's or token's WEI
 */
export const getBalance = async (
  tokenAddress: string | null = ETH_ADDRESS,
): Promise<bigint> => {
  const provider = await getWeb3Provider();
  const walletAddress = await getCurrentWalletAddress();

  if (!(provider && walletAddress)) {
    throw new Error("Error on Get Balance, Account Not connected");
  }

  autoSwitchNetwork();

  if (tokenAddress === ETH_ADDRESS) {
    return provider.getBalance(walletAddress);
  } else {
    const token = ERC20__factory.connect(tokenAddress, await provider.getSigner());
    return token.balanceOf(walletAddress);
  }
};
