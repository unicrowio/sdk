import Deferred from "../../../helpers/deferred";
import { Dispatch, useState } from "react";
import { unmountModal } from "../config/render";

export interface TUseModalStates {
  isLoading: boolean;
  setIsLoading: Dispatch<boolean>;
  loadingMessage: string;
  setLoadingMessage: Dispatch<string>;
  error: string | null;
  setError: Dispatch<any>;
  success: string | null;
  setSuccess: Dispatch<any>;
  onModalClose: (reason?: "close" | "change") => void;
}

export const useModalStates = ({
  deferredPromise,
}: {
  deferredPromise: Deferred<any>;
}): TUseModalStates => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onModalClose = (reason: "close" | "change" = "close") => {
    if (!(error || success)) {
      const noActionCloseError = {
        message:
          reason === "change"
            ? ""
            : "User closed modal without taking any actions",
      };

      deferredPromise.resolve(noActionCloseError.message);
    } else if (!success) {
      deferredPromise.reject(error);
    } else {
      deferredPromise.resolve(success);
    }

    unmountModal();
  };

  return {
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    setError,
    success,
    setSuccess,
    onModalClose,
  };
};
