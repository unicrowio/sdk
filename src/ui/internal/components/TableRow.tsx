import React from "react";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { IBalanceDetailed } from "../../../typing";
import { TokenSymbol } from "../components";
import { useAsync } from "../hooks/useAsync";
import Skeleton from "@material-ui/lab/Skeleton";
import styled from "styled-components";

interface IBalanceWithTokenUSD extends IBalanceDetailed {
  amountInUSD?: string;
}

export const TableRow = (
  balance: IBalanceWithTokenUSD,
  onModalClose,
  setIsLoading,
) => {
  const [formattedAmountInUSD, setFormattedAmountInUSD] =
    React.useState<string>();
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
            <ExchangeCell>
              {"$"}
              {formattedAmountInUSD ? (
                formattedAmountInUSD
              ) : (
                <>
                  {" "}
                  <Skeleton width={80} height={25} />
                </>
              )}
            </ExchangeCell>
          </td>
        </>
      )}
    </tr>
  );
};

const ExchangeCell = styled.span`
  display: flex;
  align-items: center;
  justify-content: right;
`;
