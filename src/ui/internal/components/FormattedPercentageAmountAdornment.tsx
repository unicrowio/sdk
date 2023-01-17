import { IToken } from "../../../typing";
import { displayableAmountBN } from "../../../helpers";
import BigNumber from "bignumber.js";
import React from "react";

type PropsTypes = {
  amount: BigNumber; // ERC20 | Ether
  tokenInfo: IToken;
  percentage: string;
};

export const FormattedPercentageAmountAdornment = ({
  amount,
  tokenInfo,
  percentage,
}: PropsTypes) => {
  const _percentage = Number(percentage);

  if (percentage.length === 0 || _percentage > 100 || _percentage < 0) {
    return null;
  }

  const value = displayableAmountBN(
    amount.times(_percentage / 100),
    tokenInfo.decimals,
  ).toFixed(2);

  return (
    <div style={{ whiteSpace: "nowrap" }}>
      <span>{value}</span>{" "}
      <span style={{ fontWeight: "bold" }}>{tokenInfo.symbol}</span>
    </div>
  );
};
