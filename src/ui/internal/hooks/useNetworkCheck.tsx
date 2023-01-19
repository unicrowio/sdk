import React from "react";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { ModalError } from "ui/internal/components/ModalError";
import { DefaultNetwork } from "typing";

export const useNetworkCheck = () => {
  const [isCorrectNetwork, setIsCorrectNetwork] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    // initial check
    isCorrectNetworkConnected().then((isCorrect) => {
      setIsCorrectNetwork(isCorrect);
    });

    // check when network changes
    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });
  }, []);

  const onNetworkSwitch = React.useCallback(async () => {
    setIsCorrectNetwork(await isCorrectNetworkConnected());
    if (!isCorrectNetwork) {
      await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
    }
  }, [isCorrectNetwork]);

  const BodyWithNetworkCheck = React.useCallback(
    (Body: JSX.Element) =>
      isCorrectNetwork ? (
        Body
      ) : (
        <ModalError type="wrongNetwork" onClick={onNetworkSwitch} />
      ),
    [isCorrectNetwork],
  );

  return {
    isCorrectNetwork,
    BodyWithNetworkCheck,
  };
};
