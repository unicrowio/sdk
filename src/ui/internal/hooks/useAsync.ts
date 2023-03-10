import React from "react";
import useSWR, { mutate } from "swr";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { toast } from "../notification/toast";

export const useAsync = (
  args,
  fn,
  onModalClose?,
  defaultValue?,
  noRefresh?,
) => {
  const { isCorrectNetwork } = useNetworkCheck();

  const { data, isLoading, error } = useSWR(
    isCorrectNetwork ? args : null,
    fn,
    noRefresh ? {} : { refreshInterval: 1000 },
  );

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      onModalClose && onModalClose();
    }
  }, [error]);

  return [error ? null : data || defaultValue, isLoading, error];
};

export const stopAsync = () => {
  mutate(() => true, undefined, { revalidate: false });
};
