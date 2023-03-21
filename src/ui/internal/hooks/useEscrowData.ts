import useSWR from "swr";
import { IGetEscrowData } from "typing";
import { useNetworkCheck } from "ui/internal/hooks/useNetworkCheck";
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
  const { isCorrectNetwork } = useNetworkCheck();
  if (!isCorrectNetwork) return { data: null, isLoading: false, error: null };

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
