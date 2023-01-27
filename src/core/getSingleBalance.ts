import {
  getSplitFromLoggedUser,
  displayableAmount,
  displayableAmountBN,
} from "../helpers";
import BigNumber from "bignumber.js";
import { IBalanceWithTokenInfo } from "../typing";
import { getEscrowData } from "./getEscrowData";

/**
 * Gets balance of currently logged user from an escrow.
 *
 * @returns The user's balance, status, token info , and other details
 */
export const getSingleBalance = async (
  escrowId: number,
): Promise<IBalanceWithTokenInfo> => {
  const escrowData = await getEscrowData(escrowId);

  const amount = getSplitFromLoggedUser(escrowData, escrowData.connectedWallet);

  const amountBN = new BigNumber(amount);

  const balance: IBalanceWithTokenInfo = {
    token: {
      address: escrowData.token.address,
      symbol: escrowData.token.symbol,
      decimals: escrowData.token.decimals,
    },
    status: "Ready to claim",
    amount: amountBN.toString(),
    amountBN: displayableAmountBN(amountBN, escrowData.token.decimals),
    displayableAmount: displayableAmount(amountBN, escrowData.token.decimals),
    connectedUser: escrowData.connectedUser,
    connectedWallet: escrowData.connectedWallet,
    statusEscrow: escrowData.status,
  };

  return balance;
};
