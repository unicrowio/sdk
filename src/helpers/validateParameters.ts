import { ethers } from "ethers";
import { IToken, IValidateProps } from "../typing";
import { parseAmount } from "./formatAmount";
import { getTokenInfo } from "../core";
import {
  validateAddresses,
  resolveEns,
  ResolvedAddrs,
} from "./validateAddresses";

export interface validAddrsToken {
  addresses: ResolvedAddrs;
  token: IToken;
}

export const validateParameters = async (
  data: IValidateProps,
): Promise<validAddrsToken> => {
  const {
    seller,
    arbitrator,
    marketplace,
    amount,
    challengePeriod,
    challengePeriodExtension,
    arbitratorFee,
    marketplaceFee,
    tokenAddress = ethers.ZeroAddress,
    buyer,
  } = data;

  const addresses = await resolveEns({
    seller,
    arbitrator,
    marketplace,
    buyer,
  });

  try {
    validateAddresses({ ...addresses.common, tokenAddress });
  } catch (e: any) {
    throw new Error(e.message);
  }

  let token: IToken;
  try {
    token = await getTokenInfo(tokenAddress);
  } catch (e: any) {
    throw new Error(
      "Failed to fetch token info (or invalid token address). Error:",
      e.message,
    );
  }

  if (buyer.toLowerCase() === seller.toLowerCase()) {
    throw new Error("Buyer cannot be the same as the seller");
  }

  try {
    const solidityAmount = parseAmount(amount.toString(), token.decimals);
    if (solidityAmount <= 0) {
      throw new Error(`Invalid amount: ${amount} <= 0.`);
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

  return {
    addresses,
    token,
  };
};
