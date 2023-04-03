import {
  CalculateAmountsInput,
  CalculateFunction,
  tShares,
  tSplits,
} from "../typing";

// Used to calculate WEI amounts
export const calculatePercentageInt = (
  percentage: number,
  amount: bigint,
): bigint => {
  // Round percentage to 16 decimal places (max)
  const percentageStr: string = percentage.toFixed(16);

  // Calculate the number of decimal places
  const decimalIndex: number = percentageStr.indexOf(".");
  const decimalPlaces: number =
    decimalIndex >= 0 ? percentageStr.length - decimalIndex - 1 : 0;

  // Calculate the divisor based on the number of decimal places
  const percentageInt: bigint = BigInt(percentageStr.replace(".", ""));
  const divisor: bigint = BigInt(10 ** decimalPlaces);

  return percentageInt > 0n
    ? (percentageInt * amount) / divisor // Shift the decimal point
    : 0n;
};

// Used to calculate percentages (of percentages)
export const calculatePercentageFloat = (
  percentage: number,
  amount: number,
): number => {
  return percentage > 0 ? (percentage / 100) * amount : 0;
};

const calculateShares = (newSplit: tSplits, amount: bigint) =>
  ({
    amountBuyer: calculatePercentageInt(newSplit.splitBuyer, amount),
    amountSeller: calculatePercentageInt(newSplit.splitSeller, amount),
    amountProtocol: calculatePercentageInt(newSplit.splitProtocol, amount),
    amountMarketplace: calculatePercentageInt(
      newSplit.splitMarketplace,
      amount,
    ),
    amountArbitrator: calculatePercentageInt(newSplit.splitArbitrator, amount),
  }) as tShares;

const zeroSplits = () => {
  return {
    splitBuyer: 0,
    splitProtocol: 0,
    splitSeller: 0,
    splitMarketplace: 0,
    splitArbitrator: 0,
  } as tSplits;
};

const calculateSharesWithoutArbitration = ({
  amount,
  splitBuyer,
  splitProtocol,
  splitSeller,
  splitMarketplace,
  arbitratorFee = 0,
}: CalculateFunction): tShares => {
  const newSplit = zeroSplits();

  newSplit.splitProtocol = calculatePercentageFloat(splitProtocol, splitSeller);
  newSplit.splitMarketplace = calculatePercentageFloat(
    splitMarketplace,
    splitSeller,
  );

  newSplit.splitArbitrator = calculatePercentageFloat(
    arbitratorFee,
    splitSeller,
  );

  newSplit.splitSeller =
    splitSeller -
    newSplit.splitProtocol -
    newSplit.splitMarketplace -
    newSplit.splitArbitrator;

  newSplit.splitBuyer = splitBuyer;

  const shares = calculateShares(newSplit, amount);

  return shares;
};

const calculateSharesWithArbitration = ({
  amount,
  splitBuyer,
  splitProtocol,
  splitSeller,
  splitMarketplace,
  arbitratorFee = 0,
}: CalculateFunction): tShares => {
  const newSplit = zeroSplits();
  newSplit.splitArbitrator = arbitratorFee;
  newSplit.splitProtocol = calculatePercentageFloat(splitProtocol, splitSeller);

  newSplit.splitMarketplace = calculatePercentageFloat(
    splitMarketplace,
    splitSeller,
  );

  newSplit.splitSeller =
    splitSeller -
    newSplit.splitMarketplace -
    newSplit.splitProtocol -
    (arbitratorFee * splitSeller) / 100;

  newSplit.splitBuyer = splitBuyer - (arbitratorFee * splitBuyer) / 100;

  const shares = calculateShares(newSplit, amount);

  return shares;
};

/**
 * Calculates how the amounts of an escrow are split between all relevant parties.
 * If settled by an arbitrator, this is considered in the calculation (arbitrator gets full share)
 *
 * @param data - Input data for the calculation (total amount in the escrow, and % splits)
 * @returns Shares of the escrow for each party (incl. fees) in token's or ETH's WEI
 */
export const calculateAmounts = (
  data: CalculateAmountsInput,
  isSettledByArbitrator = false,
): tShares => {
  return isSettledByArbitrator
    ? calculateSharesWithArbitration(data)
    : calculateSharesWithoutArbitration(data);
};
