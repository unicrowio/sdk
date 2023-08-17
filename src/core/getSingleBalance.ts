import { getSplitFromLoggedUser, formatAmount } from "../helpers";
import { IBalanceDetailed } from "../typing";
import { getEscrowData } from "./getEscrowData";

/**
 * Calculates how much of the defined escrow belongs to the connected account should the escrow be claimed in its current status
 *
 * @param escrowId - ID of the escrow
 * @returns User's balance in the escrow
 */
export const getSingleBalance = async (
  escrowId: number,
): Promise<IBalanceDetailed> => {
  const escrowData = await getEscrowData(escrowId);

  const amount = getSplitFromLoggedUser(escrowData, escrowData.walletAddress);

  const balance: IBalanceDetailed = {
    token: {
      address: escrowData.token.address,
      symbol: escrowData.token.symbol,
      decimals: escrowData.token.decimals,
    },
    status: escrowData.status,
    solidityAmount: amount,
    displayableAmount: formatAmount(amount, escrowData.token.decimals),
    connectedUser: escrowData.connectedUser,
    walletAddress: escrowData.walletAddress,
  };

  return balance;
};
