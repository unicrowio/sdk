import { formatToUSD } from "./formatToUSD";

export const formatAmountToUSD = (
  amount: string | number | bigint,
  exchangeValue: number,
): string => {
  const amountInUSD = Number(amount) * exchangeValue;
  return formatToUSD(amountInUSD);
};
