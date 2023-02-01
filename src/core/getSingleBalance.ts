import {
  getSplitFromLoggedUser,
  displayableAmount,
  displayableAmountBN,
} from "../helpers";
import BigNumber from "bignumber.js";
import { IBalanceWithTokenInfo } from "../typing";
import { getEscrowData } from "./getEscrowData";

/**
 * Calculates how much of the defined escrow belongs to the connected account should the escrow be claimed in its current status
 *
 * @param escrowId - ID of the escrow 
 * @returns User's balance in the escrow
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
