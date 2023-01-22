import React from "react";
import useSWR from "swr";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { toast } from "../notification/toast";

export const useAsync = (fn, args, onModalClose?, defaultValue?) => {
  const { isCorrectNetwork } = useNetworkCheck();

  const { data, isLoading, error } = useSWR(isCorrectNetwork ? args : null, fn);

  React.useEffect(() => {
    if (error) {
      toast(error.message, "error");
      onModalClose && onModalClose();
    }
  }, [error]);

  return [error ? null : data || defaultValue, isLoading, error];
};
