import React, { Dispatch } from "react";
import { formatAmountToUSD } from "../../../helpers";
import { IBalanceDetailed } from "../../../typing";
import { TokenSymbol } from ".";
import Skeleton from "@mui/material/Skeleton";
import styled from "styled-components";
import type * as CSS from "csstype";
import { BigCheckIcon } from "../assets/BigCheckIcon";
import { Table } from "../components";
import { useExchangeRates } from "ui/internal/hooks/useExchangeRates";

interface IBalanceWithTokenUSD extends IBalanceDetailed {
  amountInUSD?: string;
}

const wrapperStyles: CSS.Properties = {
  margin: "0 auto",
  textAlign: "center",
  fontWeight: 500,
};

const ClaimSuccessful = ({ amount }: { amount: number }) => {
  return (
    <div style={wrapperStyles}>
      <BigCheckIcon />
      <p>{amount === 1 ? "Payment" : "All balances"} claimed!</p>
    </div>
  );
};

export const BalancesTable = ({
  chainId,
  balances,
  onModalClose,
  setIsLoading,
  success,
}: {
  chainId: bigint;
  balances: IBalanceDetailed[];
  onModalClose: VoidFunction;
  setIsLoading: Dispatch<React.SetStateAction<boolean>>;
  success: string;
}) => {
  return (
    <>
      {success && <ClaimSuccessful amount={balances.length} />}
      {!success && (
        <Table>
          <thead>
            <tr>
              <th>Currency</th>
              <th>USD Value</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance: IBalanceWithTokenUSD) =>
              TableRow(chainId, balance, onModalClose, setIsLoading),
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

const TableRow = (
  chainId: bigint,
  balance: IBalanceWithTokenUSD,
  onModalClose: VoidFunction,
  setIsLoading: Dispatch<React.SetStateAction<boolean>>,
) => {
  const [formattedAmountInUSD, setFormattedAmountInUSD] =
    React.useState<string>(balance.displayableAmount);

  const { data: exchangeValues, error: errorExchange } = useExchangeRates(
    chainId,
    [balance?.token?.address],
  );

  React.useEffect(() => {
    if (balance) {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (exchangeValues) {
      const exchangeValue = exchangeValues[balance.token.address.toLowerCase()];
      setIsLoading(false);

      if (exchangeValue) {
        setFormattedAmountInUSD(
          formatAmountToUSD(balance.displayableAmount, exchangeValue),
        );
      }
    }
    return () => {
      setFormattedAmountInUSD("");
    };
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
            {balance.displayableAmount}{" "}
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
