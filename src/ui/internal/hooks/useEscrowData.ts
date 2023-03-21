import useSWR from "swr";
import { IGetEscrowData } from "typing";
import { getEscrowData } from "../../../core/getEscrowData";

export const useEscrowData = (id: number, refreshInterval = 0) => {
  const { data, isLoading, error } = useSWR<IGetEscrowData>(
    String(id),
    getEscrowData,
    {
      refreshInterval,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};
