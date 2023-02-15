import React from "react";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { IBalanceDetailed } from "../../../typing";
import { TokenSymbol } from ".";
import { useAsync } from "../hooks/useAsync";
import Skeleton from "@material-ui/lab/Skeleton";
import styled from "styled-components";
import type * as CSS from "csstype";
import { BigCheckIcon } from "../assets/BigCheckIcon";
import { Table } from "../components";
import { STABLE_COINS } from "helpers/getExchangeRates";

interface IBalanceWithTokenUSD extends IBalanceDetailed {
  amountInUSD?: string;
}

const noBalancesCellStyle: CSS.Properties = {
  textAlign: "center",
  padding: "40px 0 20px 0",
};

const wrapperStyles: CSS.Properties = {
  margin: "0 auto",
  textAlign: "center",
  fontWeight: 500,
};

const ClaimSuccessful = () => {
  return (
    <div style={wrapperStyles}>
      <BigCheckIcon />
      <p>All balances claimed!</p>
    </div>
  );
};

export const BalancesTable = ({
  balances,
  onModalClose,
  setIsLoading,
  success,
}) => {
  return (
    <>
      {success && <ClaimSuccessful />}
      {!success && (
        <Table>
          <thead>
            <tr>
              <th>Currency</th>
              <th>USD Value</th>
            </tr>
          </thead>
          <tbody>
            {balances.length > 0 ? (
              balances.map((balance: IBalanceWithTokenUSD) =>
                TableRow(balance, onModalClose, setIsLoading),
              )
            ) : (
              <tr>
                <td style={noBalancesCellStyle} colSpan={2}>
                  All balances claimed!
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

const TableRow = (
  balance: IBalanceWithTokenUSD,
  onModalClose,
  setIsLoading,
) => {
  const isStableCoin = STABLE_COINS.includes(balance?.token?.symbol);

  const [formattedAmountInUSD, setFormattedAmountInUSD] =
    React.useState<string>(
      isStableCoin && balance.amountBN.toNumber().toFixed(2),
    );

  const [exchangeValues, , errorExchange] = useAsync(
    [balance?.token?.symbol],
    isStableCoin ? null : getExchangeRates,
    onModalClose,
  );

  React.useEffect(() => {
    if (balance && isStableCoin) {
      setIsLoading(false);
    }
  }, []);

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
    return () => {
      setFormattedAmountInUSD('');
    }
  }, [exchangeValues]);

  React.useEffect(() => {
    if (errorExchange) {
      setIsLoading(false);
      setFormattedAmountInUSD("n/a (error)");
    }
  }, [errorExchange]);

  return (
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
