import React from "react";
import useSWR, { mutate } from "swr";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { toast } from "../notification/toast";

// TODO use typescript properly
// interface IUseAsync {
//   data: any;
//   error: any;
//   isLoading: boolean;
// }

// TODO Crate a custom hook for each fecther or data instead of generic one.

export const useAsync = (
  args: any,
  fetcher: (args?: any) => Promise<any>,
  onModalClose?: VoidFunction,
  defaultValue?: any,
  shouldRefresh = true,
) => {
  const { isCorrectNetwork } = useNetworkCheck();

  const { data, isLoading, error } = useSWR(
    isCorrectNetwork ? args : null,
    fetcher,
    shouldRefresh ? {} : { refreshInterval: 1000 },
  );

  // TODO remove this useEffect
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      onModalClose && onModalClose();
    }
  }, [error]);

  // TODO return object instead of array
  return [error ? null : data || defaultValue, isLoading, error];
};

export const stopAsync = () => {
  mutate(() => true, undefined, { revalidate: false });
};
