import { Console } from "console";
import { IPaymentProps } from "../typing";
import { ETH_ADDRESS } from "./constants";
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

export const validateParameters = async (data: IPaymentProps) => {
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
  } = data;

  const addrs: AddressToReturn = await validateEns({
    seller,
    arbitrator,
    marketplace,
  });

  try {
    validateAddress({ ...addrs.common, tokenAddress });
  } catch (e: any) {
    throw new Error(e.message);
  }

  console.log({ addrs });

  // if(addrs.common.buyer.toLowerCase() === addrs.common.seller.toLowerCase()) {
  //   throw new Error("Buyer cannot be the same as the seller");
  // }

  if (amount <= 0) {
    throw new Error("Invalid amount");
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
