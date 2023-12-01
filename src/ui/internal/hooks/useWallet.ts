import React from "react";
import { getCurrentWalletAddress } from "../../../wallet";
import { toast } from "../notification/toast";

export const useWallet = () => {
  const [walletUser, setWalletUser] = React.useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = React.useState(true);
  const [isErrorWallet, setIsErrorWallet] = React.useState(false);

  React.useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setIsLoadingWallet(true);
        const walletUser = await getCurrentWalletAddress();
        setWalletUser(walletUser);
      } catch (error) {
        toast.error(error);
        setIsErrorWallet(true);
        setWalletUser(null);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchWalletAddress();
  }, []);

  return { walletUser, isLoadingWallet, isErrorWallet };
};
