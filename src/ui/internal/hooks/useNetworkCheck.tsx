import React from "react";
import {
  isCorrectNetworkConnected,
  isWeb3WalletInstalled,
  startListeningNetwork,
  stopListeningNetwork,
  switchNetwork,
} from "wallet";
import { ModalError } from "ui/internal/components/ModalError";
import { DefaultNetwork } from "typing";
import { metamaskUrl } from "../../../helpers/constants";

export const useNetworkCheck = () => {
  const metamaskInstalled = isWeb3WalletInstalled();
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
    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });

    return () => {
      stopListeningNetwork();
      controller.abort();
    };
  }, []);

  const onNetworkSwitch = React.useCallback(async () => {
    setIsCorrectNetwork(await isCorrectNetworkConnected());
    if (!isCorrectNetwork) {
      await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
    }
  }, [isCorrectNetwork]);

  const WithNetworkCheck = React.useCallback(
    (Body: JSX.Element) =>
      !metamaskInstalled ? (
        <ModalError
          onClick={() => window.open(metamaskUrl)}
          type="noMetaMask"
        />
      ) : isCorrectNetwork ? (
        Body
      ) : (
        <ModalError type="wrongNetwork" onClick={onNetworkSwitch} />
      ),
    [isCorrectNetwork, metamaskInstalled],
  );

  return {
    isCorrectNetwork,
    WithNetworkCheck,
  };
};
