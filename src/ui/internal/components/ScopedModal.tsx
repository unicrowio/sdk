import React, { ReactElement, ReactNode } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalHeaderClose,
  ModalHeaderTitle,
} from "../../../ui/internal/components/Modal";
import { CloseIcon } from "../assets/CloseIcon";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { isWeb3WalletInstalled } from "../../../wallet";
import { ModalError } from "./ModalError";
import { metamaskUrl } from "../../../helpers/constants";
import { Forbidden } from "./Forbidden";
import { ModalBodySkeleton } from "./ModalBodySkeleton";

interface ScopedModalProps {
  title: string;
  body: ReactNode;
  footer: ReactNode;
  isLoading: boolean;
  loadingMessage: string;
  onClose?: () => any;
  modalAction?: any;
}

export const ScopedModal: React.FunctionComponent<ScopedModalProps> = (
  props,
): JSX.Element => {
  const { WithNetworkCheck } = useNetworkCheck();
  const metamaskInstalled = isWeb3WalletInstalled();
  const { isForbidden = false, reason } = props.modalAction || {};

  const bodyContent = React.Children.toArray(props.body)[0] as any;
  const [bodyIsEmpty, setBodyIsEmpty] = React.useState(true);

  React.useEffect(() => {
    setBodyIsEmpty([null, false].includes(bodyContent.type()));
  }, [bodyContent]);

  const BodyWithFooter = React.useCallback(
    () =>
      WithNetworkCheck(
        <>
          {isForbidden && (
            <Forbidden description={reason} onClose={props.onClose} />
          )}
          {!metamaskInstalled && (
            <ModalError
              onClick={() => window.open(metamaskUrl)}
              type="noMetaMask"
            />
          )}
          {!isForbidden && metamaskInstalled && (
            <ModalBody>
              {bodyIsEmpty && <ModalBodySkeleton />}
              {!bodyIsEmpty && (
                <>
                  {props.body}
                  <ModalFooter>
                    <>{props.footer}</>
                  </ModalFooter>
                </>
              )}
            </ModalBody>
          )}
        </>,
      ),
    [
      props.body,
      props.footer,
      WithNetworkCheck,
      metamaskInstalled,
      isForbidden,
      reason,
    ],
  );

  return (
    <Modal isLoading={!!props?.isLoading} loadingMessage={props.loadingMessage}>
      <ModalHeader>
        <ModalHeaderTitle>{props.title}</ModalHeaderTitle>
        <ModalHeaderClose onClick={props.onClose}>
          <CloseIcon />
        </ModalHeaderClose>
      </ModalHeader>
      <BodyWithFooter />
    </Modal>
  );
};
