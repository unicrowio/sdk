import useSWR from "swr";
import { IBalanceDetailed } from "typing";
import { getSingleBalance } from "../../../core";

export const useSingleBalance = (id: number, refreshInterval = 0) => {
  const { data, isLoading, error } = useSWR<IBalanceDetailed>(
    String(id),
    getSingleBalance,
    {
      refreshInterval,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};
