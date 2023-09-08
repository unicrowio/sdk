import { IToken, IValidateProps } from "../typing";
import { ETH_ADDRESS } from "./constants";
import { parseAmount } from "./formatAmount";
import { getTokenInfo } from "../core";
import {
  validateAddress,
  validateEns,
  AddressToReturn,
} from "./validateAddress";

export interface AddressesToCheck {
  arbitrator?: string;
  marketplace?: string;
  seller?: string;
  tokenAddress?: string;
}

export const validateParameters = async (data: IValidateProps) => {
  const {
    seller,
    arbitrator,
    marketplace,
    amount,
    challengePeriod,
    challengePeriodExtension,
    arbitratorFee,
    marketplaceFee,
    tokenAddress = ETH_ADDRESS,
    buyer,
  } = data;

  const addrs: AddressToReturn = await validateEns({
    seller,
    arbitrator,
    marketplace,
  });

  let token: IToken;
  try {
    validateAddress({ ...addrs.common, tokenAddress });
    token = await getTokenInfo(tokenAddress);
  } catch (e: any) {
    throw new Error(e.message);
  }

  if (buyer.toLowerCase() === seller.toLowerCase()) {
    throw new Error("Buyer cannot be the same as the seller");
  }

  try {
    const _amount = parseAmount(amount.toString(), token.decimals);
    if (_amount <= 0) {
      throw new Error(`Invalid amount (${amount}<=0).`);
    }
  } catch (e: any) {
    throw new Error(`Invalid amount: ${amount} error: ${e.message}.`);
  }

  if (
    !Number.isInteger(challengePeriod) ||
    challengePeriod < 0 ||
    challengePeriod >= 71582788
  ) {
    throw new Error("Invalid challenge period");
  }

  if (
    Number.isNaN(challengePeriodExtension) ||
    (typeof challengePeriodExtension !== "undefined" &&
      challengePeriodExtension <= 0)
  ) {
    throw new Error("Invalid challenge period extension");
  }

  if (
    Number.isNaN(arbitratorFee) ||
    (typeof arbitratorFee !== "undefined" && arbitratorFee < 0)
  ) {
    throw new Error("Invalid arbitrator fee");
  }

  // if (
  //   !arbitrator && arbitratorFee > 0
  // ) {
  //   throw new Error("Arbitrator fee must be 0 if arbitrator address is not defined");
  // }

  if (!marketplace && marketplaceFee > 0) {
    throw new Error(
      "Marketplace fee must be 0 if marketplace address is not defined",
    );
  }

  if (
    Number.isNaN(marketplaceFee) ||
    (typeof marketplaceFee !== "undefined" && marketplaceFee < 0)
  ) {
    throw new Error("Invalid marketplace fee");
  }

  return addrs;
};
