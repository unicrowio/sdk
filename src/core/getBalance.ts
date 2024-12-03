import { ethers } from "ethers";
import { ERC20__factory } from "@unicrowio/ethers-types";
import {
  getWeb3Provider,
  getCurrentWalletAddress,
  autoSwitchNetwork,
} from "../wallet";

/**
 * Checks if the user has the funds to pay for the given amount ETH or ERC-20 token.
 *
 * @param tokenAddress - Address of the token to check the user's balance of (address zero for ETH).
 * @returns User's balance as BigInt of ETH's or token's WEI
 */
export const getBalance = async (
  tokenAddress: string | null = ethers.ZeroAddress,
): Promise<bigint> => {
  const provider = await getWeb3Provider();
  const walletAddress = await getCurrentWalletAddress();

  if (!(provider && walletAddress)) {
    throw new Error("Error on Get Balance, Account Not connected");
  }

  autoSwitchNetwork();

  if (tokenAddress === ethers.ZeroAddress) {
    return provider.getBalance(walletAddress);
  } else {
    const token = ERC20__factory.connect(
      tokenAddress,
      await provider.getSigner(),
    );
    return token.balanceOf(walletAddress);
  }
};
