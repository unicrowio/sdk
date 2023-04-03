import { IToken } from "../../../typing";
import { displayableAmountBI } from "../../../helpers";
import { calculatePercentageInt } from "../../../core/calculateAmounts";
import React from "react";

interface PropsTypes {
  amount: bigint; // ERC20 | Ether
  tokenInfo: IToken;
  percentage: string;
}

export const FormattedPercentageAmountAdornment = ({
  amount,
  tokenInfo,
  percentage,
}: PropsTypes) => {
  const _percentage = Number(percentage);

  if (percentage.length === 0 || _percentage > 100 || _percentage < 0) {
    return null;
  }

  const value = displayableAmountBI(
    calculatePercentageInt(_percentage, amount),
    tokenInfo.decimals,
  ).toFixed(2);

  return (
    <div style={{ whiteSpace: "nowrap" }}>
      <span>{value}</span>{" "}
      <span style={{ fontWeight: "bold" }}>{tokenInfo.symbol}</span>
    </div>
  );
};
