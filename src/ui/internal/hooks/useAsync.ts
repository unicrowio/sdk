import React from "react";
import useSWR from "swr";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { toast } from "../notification/toast";

export const useAsync = (args, fn, onModalClose?, defaultValue?) => {
  const { isCorrectNetwork } = useNetworkCheck();

  const { data, isLoading, error } = useSWR(
    isCorrectNetwork ? args : null,
    fn,
    { refreshInterval: 1000 },
  );

  React.useEffect(() => {
    if (error) {
      toast.error("error");
      onModalClose && onModalClose();
    }
  }, [error]);

  return [error ? null : data || defaultValue, isLoading, error];
};
