import { formatToUSD } from "./formatToUSD";

export const formatAmountToUSD = (
  amount: string | number | bigint,
  exchangeValue: number,
): string => {
  const _amount = typeof amount === "number" ? amount : Number(amount);
  const amountInUSD = _amount * exchangeValue;
  return formatToUSD(amountInUSD);
};
