import { STABLE_COINS } from "./getExchangeRates";

const calculate = (amount: bigint, tokenPrecision: number) => {
  return Number(amount) / Math.pow(10, tokenPrecision);
};

export const displayableAmount = (amount: bigint, tokenPrecision: number) => {
  return calculate(amount, tokenPrecision).toString();
};

export const displayableAmountBI = (amount: bigint, tokenPrecision: number) => {
  return calculate(amount, tokenPrecision);
};

export const displayDecimals = (tokenSymbol: string) =>
  !tokenSymbol ? 2 : STABLE_COINS.includes(tokenSymbol.toUpperCase()) ? 2 : 4;
