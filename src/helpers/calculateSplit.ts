import BigNumber from "bignumber.js";
import { calculateAmounts } from "../core";
import { IGetEscrowData } from "../typing";
import { isSameAddress } from "./isSameAddress";

// Get buyer or seller split based on logged in user participation
export const getSplitFromLoggedUser = (
  current: IGetEscrowData,
  walletUserAddress: string,
) => {
  const isSettledByArbitrator = current.arbitration.arbitrated;

  const { amountBuyer, amountSeller, amountArbitrator, amountMarketplace } =
    calculateAmounts(
      {
        amount: current.amount.toNumber(),
        splitBuyer: current.splitBuyer,
        splitSeller: current.splitSeller,
        splitProtocol: current.splitProtocol,
        splitMarketplace: current.splitMarketplace,
        arbitratorFee: current.arbitration.arbitratorFee,
      },
      isSettledByArbitrator,
    );

  if (isSameAddress(current.buyer, walletUserAddress)) {
    return amountBuyer;
  }

  if (isSameAddress(current.seller, walletUserAddress)) {
    return amountSeller;
  }

  if (isSameAddress(current.marketplace, walletUserAddress)) {
    return amountMarketplace;
  }

  if (isSameAddress(current.arbitration.arbitrator, walletUserAddress)) {
    return amountArbitrator;
  }

  return 0; // Ther user is not a party (seller, buyer, marketplace, arbitrator)
};

export const calculateSplit = (
  group: IGetEscrowData[],
  walletUserAddress: string,
) =>
  group.reduce((acc, current) => {
    const amount = getSplitFromLoggedUser(current, walletUserAddress);
    return acc.plus(amount);
  }, new BigNumber(0));
