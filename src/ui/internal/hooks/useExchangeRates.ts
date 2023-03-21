import { IResult, STABLE_COINS } from "helpers/getExchangeRates";
import useSWR from "swr";
import { getExchangeRates } from "../../../helpers";

export const useExchangeRates = (symbol: string, refreshInterval = 0) => {
  // check if symbol is a stable coin, if yes, we don't need to get rate in USD
  if (STABLE_COINS.includes(symbol)) {
    return { data: null, isLoading: false, error: null };
  }

  const { data, isLoading, error } = useSWR<IResult>(
    [symbol],
    getExchangeRates,
    {
      refreshInterval,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};
