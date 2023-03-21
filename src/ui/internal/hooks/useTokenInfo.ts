import { getTokenInfo } from "../../../core/getTokenInfo";
import useSWR from "swr";
import { IToken } from "typing";

export const useTokenInfo = (tokenAddress: string) => {
  const { data, isLoading, error } = useSWR<IToken>(
    tokenAddress,
    getTokenInfo,
    {
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};
