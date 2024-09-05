import { ERC20__factory } from "@unicrowio/ethers-types";
import {
  getWeb3Provider,
  getCurrentWalletAddress,
  autoSwitchNetwork,
} from "../wallet";
import { ETH_ADDRESS } from "../helpers";

/**
 * Checks if the user has the funds to pay for the given amount ETH or ERC-20 token.
 *
 * @param tokenAddress - Address of the token to check the user's balance of (address zero for ETH).
 * @returns User's balance as BigInt of ETH's or token's WEI
 */
export const getBalance = async (
  tokenAddress: string | null = ETH_ADDRESS,
): Promise<bigint> => {
  const provider = getWeb3Provider();
  const walletAddress = await getCurrentWalletAddress();

  if (!(provider && walletAddress)) {
    throw new Error("Error on Get Balance, Account Not connected");
  }

  await autoSwitchNetwork();

  if (tokenAddress === ETH_ADDRESS) {
    return provider.getBalance(walletAddress);
  } else {
    const token = ERC20__factory.connect(
      tokenAddress,
      await provider.getSigner(),
    );
    return token.balanceOf(walletAddress);
  }
};
