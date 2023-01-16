import React from "react";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { IncorrectNetwork } from "ui/components/IncorrectNetwork";
import { DefaultNetwork } from "config/setup";

export const useNetworkCheck = () => {
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);

  React.useEffect(() => {
    isCorrectNetworkConnected().then((isCorrect) => {
      setIsCorrectNetwork(isCorrect);
    });

    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });
  }, []);

  const BodyWithNetworkCheck = (Body: JSX.Element) => {
    const onNetworkSwitch = React.useCallback(async () => {
      setIsCorrectNetwork(await isCorrectNetworkConnected());
      if (!isCorrectNetwork) {
        await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
      }
    }, [isCorrectNetwork]);

    return isCorrectNetwork ? (
      Body
    ) : (
      <IncorrectNetwork onClick={onNetworkSwitch} />
    );
  };

  const FooterWithNetworkCheck = (Footer: JSX.Element) => {
    return isCorrectNetwork ? Footer : null;
  };

  return {
    isCorrectNetwork,
    BodyWithNetworkCheck,
    FooterWithNetworkCheck,
  };
};
