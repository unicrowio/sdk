import { STABLE_COINS } from "./getExchangeRates";

const calculate = (amount: bigint, tokenPrecision: number | bigint) => {
  return Number(amount) / Math.pow(10, Number(tokenPrecision));
};

export const displayableAmount = (
  amount: bigint,
  tokenPrecision: number | bigint,
) => {
  return calculate(amount, tokenPrecision).toString();
};

export const displayableAmountBI = (
  amount: bigint,
  tokenPrecision: number | bigint,
) => {
  return calculate(amount, tokenPrecision);
};
