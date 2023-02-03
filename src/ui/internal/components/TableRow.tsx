import React from "react";
import { getTokenInfo } from "../../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { IBalanceWithTokenInfo } from "../../../typing";
import { TokenSymbol } from "../components";
import { useAsync } from "../hooks/useAsync";

interface IBalanceWithTokenUSD extends IBalanceWithTokenInfo {
  amountInUSD?: string;
}

export const TableRow = (
  balance: IBalanceWithTokenUSD,
  onModalClose,
  setIsLoading,
) => {
  const [formattedAmountInUSD, setFormattedAmountInUSD] = React.useState("");
  const [exchangeValues, , errorExchange] = useAsync(
    [balance?.token?.symbol],
    getExchangeRates,
    onModalClose,
  );
  React.useEffect(() => {
    if (exchangeValues) {
      const exchangeValue = exchangeValues[balance.token.symbol];
      setIsLoading(false);

      if (exchangeValue) {
        setFormattedAmountInUSD(
          formatAmountToUSD(balance.amountBN, exchangeValue),
        );
      }
    }
  }, [exchangeValues]);

  React.useEffect(() => {
    if (errorExchange) {
      setIsLoading(false);
      setFormattedAmountInUSD("n/a (error)");
    }
  }, [errorExchange]);

  return !balance ? (
    <tr></tr>
  ) : (
    <tr key={`balance-${balance.token.address}`}>
      {balance.token.symbol && (
        <>
          <td>
            {balance.amountBN
              .toNumber()
              .toFixed(displayDecimals(balance.token.symbol))}{" "}
            <TokenSymbol>{balance.token.symbol}</TokenSymbol>
          </td>
          <td>
            {"$"}
            {formattedAmountInUSD}
          </td>
        </>
      )}
    </tr>
  );
};
