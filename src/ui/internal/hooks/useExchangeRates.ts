import { IResult } from "helpers/getExchangeRates";
import useSWR from "swr";
import { getExchangeRates } from "../../../helpers";

export const useExchangeRates = (
  chainId: bigint,
  tokensAddresses: string[],
  refreshInterval = 0,
) => {
  const { data, isLoading, error } = useSWR<IResult>(
    [chainId, tokensAddresses],
    ([chainId, tokensAddresses]: [bigint, string[]]) =>
      getExchangeRates(chainId, tokensAddresses),
    {
      refreshInterval,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};
