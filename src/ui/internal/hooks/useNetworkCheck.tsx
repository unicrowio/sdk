import React from "react";
import {
  isCorrectNetworkConnected,
  isWeb3WalletInstalled,
  isWeb3WalletConnected,
  startListeningNetwork,
  stopListeningNetwork,
  switchNetwork,
} from "wallet";
import { ModalError } from "ui/internal/components/ModalError";

export const useNetworkCheck = () => {
  const metamaskInstalled = isWeb3WalletInstalled();
  const walletConnected = isWeb3WalletConnected();
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<
    boolean | undefined
  >(undefined);

  React.useEffect(() => {
    const controller = new AbortController();

    // initial check
    isCorrectNetworkConnected().then((isCorrect) => {
      setIsCorrectNetwork(isCorrect);
    });

    // check when network changes
    startListeningNetwork((chainId) => {
      setIsCorrectNetwork(chainId === globalThis?.unicrow?.network?.chainId);
    });

    return () => {
      stopListeningNetwork();
      controller.abort();
    };
  }, []);

  const onNetworkSwitch = React.useCallback(async () => {
    setIsCorrectNetwork(await isCorrectNetworkConnected());
    if (!isCorrectNetwork) {
      await switchNetwork(globalThis?.unicrow?.network?.chainName);
    }
  }, [isCorrectNetwork]);

  const WithNetworkCheck = React.useCallback(
    (Body: JSX.Element) => (
      <>
        {!metamaskInstalled && (
          <ModalError
            onClick={() => window.open("https://metamask.io/download/")}
            type="noMetaMask"
          />
        )}
        {metamaskInstalled && !isCorrectNetwork && (
          <ModalError type="wrongNetwork" onClick={onNetworkSwitch} />
        )}
        {metamaskInstalled && walletConnected && isCorrectNetwork && Body}
      </>
    ),
    [metamaskInstalled, walletConnected, isCorrectNetwork],
  );

  return {
    isCorrectNetwork,
    WithNetworkCheck,
  };
};
