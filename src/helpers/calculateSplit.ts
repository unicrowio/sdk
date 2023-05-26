import { calculateAmounts } from "../core";
import { IGetEscrowData } from "../typing";
import { isSameAddress } from "./isSameAddress";

// Get buyer or seller split based on logged in user participation
export const getSplitFromLoggedUser = (
  {
    amount,
    splitBuyer,
    splitSeller,
    splitProtocol,
    splitMarketplace,
    arbitration,
    seller,
    marketplace,
    buyer,
  }: IGetEscrowData,
  walletUserAddress: string,
) => {
  const isSettledByArbitrator = arbitration?.arbitrated;
  const arbitratorFee = arbitration?.arbitratorFee || 0;

  const { amountBuyer, amountSeller, amountArbitrator, amountMarketplace } =
    calculateAmounts(
      {
        amount,
        splitBuyer,
        splitSeller,
        splitProtocol,
        splitMarketplace,
        arbitratorFee,
      },
      isSettledByArbitrator,
    );

  if (isSameAddress(buyer, walletUserAddress)) {
    return amountBuyer;
  }

  if (isSameAddress(seller, walletUserAddress)) {
    return amountSeller;
  }

  if (isSameAddress(marketplace, walletUserAddress)) {
    return amountMarketplace;
  }

  if (isSameAddress(arbitration?.arbitrator, walletUserAddress)) {
    return amountArbitrator;
  }

  return BigInt(0); // The user is not a party or is not logged (seller, buyer, marketplace, arbitrator)
};

export const calculateSplit = (
  group: IGetEscrowData[],
  walletUserAddress: string,
) =>
  group.reduce((acc, current) => {
    const amount = getSplitFromLoggedUser(current, walletUserAddress);
    return acc + amount;
  }, BigInt(0));
