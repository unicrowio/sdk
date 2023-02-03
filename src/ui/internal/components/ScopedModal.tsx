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
import { Forbidden } from "./Forbidden";

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
  const metamaskInstalled = checkIsWalletInstalled() !== null;
  const { isForbidden = false, reason } = props.modalAction || {};
  console.log("pwe", "modalAction", { isForbidden, reason });

  const BodyWithFooter = React.useCallback(
    () =>
      WithNetworkCheck(
        isForbidden ? (
          <Forbidden description={reason} onClose={props.onClose} />
        ) : (
          <ModalBody>
            <>
              {props.body}
              <ModalFooter>
                <>{props.footer}</>
              </ModalFooter>
            </>
          </ModalBody>
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
