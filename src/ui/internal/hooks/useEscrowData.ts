import useSWR from "swr";
import { IGetEscrowData } from "typing";
import { getEscrowData } from "../../../core/getEscrowData";

interface IUseEscrowData {
  escrowId: number;
  refreshInterval?: number;
  defaultValue?: IGetEscrowData;
}

export const useEscrowData = ({
  escrowId,
  refreshInterval = 0,
  defaultValue,
}: IUseEscrowData) => {
  if (defaultValue)
    return { data: defaultValue, isLoading: false, error: null };

  const { data, isLoading, error } = useSWR<IGetEscrowData>(
    String(escrowId),
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
