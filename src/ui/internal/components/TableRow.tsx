import React from "react";

import { getTokenInfo } from "../../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { IBalanceWithTokenInfo, IToken } from "../../../typing";
import { TokenSymbol } from "../components";
import { useNetworkCheck } from "../hooks/useNetworkCheck";

interface IBalanceWithTokenUSD extends IBalanceWithTokenInfo {
  amountInUSD?: string;
}

export const TableRow = (
  balance: IBalanceWithTokenUSD,
  onModalClose,
  setIsLoading,
) => {
  const [rowTokenInfo, setRowTokenInfo] = React.useState<IToken>();
  const [tokenInfoLoading, setTokenInfoLoading] =
    React.useState<boolean>(false);
  const [amountInUSD, setAmountInUSD] = React.useState<string>(
    balance.amountInUSD,
  );
  const { isCorrectNetwork } = useNetworkCheck();

  React.useEffect(() => {
    if (isCorrectNetwork) {
      setTokenInfoLoading(true);
      getTokenInfo(balance.token.address)
        .then(setRowTokenInfo)
        .finally(() => {
          setTokenInfoLoading(false);
        });

      getExchangeRates([balance.token.symbol]).then((exchangeValues) => {
        const symbol = balance.token.symbol as string;
        const exchangeValue = exchangeValues[symbol];

        if (exchangeValue) {
          setAmountInUSD(formatAmountToUSD(balance.amountBN, exchangeValue));
        } else {
          setAmountInUSD("n/a (error)");
        }
      });
    }
  }, [isCorrectNetwork]);

  return (
    <tr key={`balance-${balance.token.address}`}>
      {!tokenInfoLoading && rowTokenInfo ? (
        <>
          <td>
            {balance.amountBN
              .toNumber()
              .toFixed(displayDecimals(balance.token.symbol!))}{" "}
            <TokenSymbol>{rowTokenInfo.symbol}</TokenSymbol>
          </td>
          <td>
            {"$"}
            {amountInUSD}
          </td>
        </>
      ) : (
        <td>
          {tokenInfoLoading && "Loading..."}
          {!rowTokenInfo && "Error while loading Token Info"}
        </td>
      )}
    </tr>
  );
};
