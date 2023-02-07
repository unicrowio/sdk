import React, { ReactNode } from "react";
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
import { checkIsWalletInstalled } from "../../../wallet";
import { ModalError } from "./ModalError";
import { metamaskUrl } from "../../../helpers/constants";
import { ModalBodySkeleton } from "./ModalBodySkeleton";

interface ScopedModalProps {
  title: string;
  body: ReactNode;
  footer: ReactNode;
  isLoading: boolean;
  loadingMessage: string;
  onClose?: () => any;
}

export const ScopedModal: React.FunctionComponent<ScopedModalProps> = (
  props,
): JSX.Element => {
  const { WithNetworkCheck } = useNetworkCheck();
  const metamaskInstalled = checkIsWalletInstalled() !== null;

  const BodyWithFooter = React.useCallback(
    () =>
      WithNetworkCheck(
        props.body ? (
          <ModalBody>
            <>
              {props.body}
              <ModalFooter>
                <>{props.footer}</>
              </ModalFooter>
            </>
          </ModalBody>
        ) : (
          <ModalBodySkeleton />
        ),
      ),
    [props.body, props.footer, WithNetworkCheck],
  );

  return (
    <Modal isLoading={props.isLoading} loadingMessage={props.loadingMessage}>
      <ModalHeader>
        <ModalHeaderTitle>{props.title}</ModalHeaderTitle>
        <ModalHeaderClose onClick={props.onClose}>
          <CloseIcon />
        </ModalHeaderClose>
      </ModalHeader>

      {metamaskInstalled ? (
        <BodyWithFooter />
      ) : (
        <ModalError
          onClick={() => window.open(metamaskUrl)}
          type="noMetaMask"
        />
      )}
    </Modal>
  );
};
