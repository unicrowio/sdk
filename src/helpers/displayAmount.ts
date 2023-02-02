import { STABLE_COINS } from "./getExchangeRates";
import { BigNumber as BigNumberJs } from "bignumber.js";
BigNumberJs.config({ EXPONENTIAL_AT: 19 });

const calculate = (amount: BigNumberJs, tokenPrecision: number) => {

  console.log("amount", amount.toString())
  const BASE = new BigNumberJs(10);
  return amount.dividedBy(BASE.pow(tokenPrecision));
};

export const displayableAmount = (
  amount: BigNumberJs,
  tokenPrecision: number,
) => {
  return calculate(amount, tokenPrecision).toString();
};

export const displayableAmountBN = (
  amount: BigNumberJs,
  tokenPrecision: number,
) => {
  return calculate(amount, tokenPrecision);
};

export const displayDecimals = (tokenSymbol: string) =>
  STABLE_COINS.includes(tokenSymbol.toUpperCase()) ? 2 : 4;
