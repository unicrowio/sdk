import {
  getSplitFromLoggedUser,
  displayableAmount,
  displayableAmountBN,
} from "../helpers";
import BigNumber from "bignumber.js";
import { IBalanceWithTokenInfo } from "../typing";
import { getEscrowData } from "./getEscrowData";

/**
 * Gets balance of an escrow with its token info.
 *
 * @returns {Promise<IBalanceWithTokenInfo>}
 */
export const getSingleBalance = async (
  escrowId: number,
): Promise<IBalanceWithTokenInfo> => {
  const escrowData = await getEscrowData(escrowId);
  const { arbitrated = false, arbitratorFee = 0 } =
    escrowData.arbitration || {};

  const amount = getSplitFromLoggedUser(
    {
      amount: escrowData.amount,
      split_buyer: escrowData.splitBuyer,
      split_seller: escrowData.splitSeller,
      split_protocol: escrowData.splitProtocol,
      split_marketplace: escrowData.splitMarketplace,
      buyer: escrowData.buyer,
      seller: escrowData.seller,
      marketplace: escrowData.marketplace,
      arbitrator_fee: arbitratorFee,
      arbitrated,
    },
    escrowData.connectedWallet,
  );

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
