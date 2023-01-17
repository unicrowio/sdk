import React from "react";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { IncorrectNetwork } from "ui/internal/components/IncorrectNetwork";
import { DefaultNetwork } from "config/setup";

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

  const BodyWithNetworkCheck = React.useCallback(
    (Body: JSX.Element) => {
      const onNetworkSwitch = async () => {
        setIsCorrectNetwork(await isCorrectNetworkConnected());
        if (!isCorrectNetwork) {
          await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
        }
      };

      return isCorrectNetwork ? (
        Body
      ) : (
        <IncorrectNetwork onClick={onNetworkSwitch} />
      );
    },
    [isCorrectNetwork],
  );

  return {
    isCorrectNetwork,
    BodyWithNetworkCheck,
  };
};
