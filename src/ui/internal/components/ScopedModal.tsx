import React, { ReactNode } from "react";
import {
  Modal,
  ModalBody,
  ModalEmptyBody,
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

interface ScopedModalProps {
  title: string;
  body: ReactNode;
  footer: string;
  isLoading: boolean;
  loadingMessage: string;
  onClose?: () => any;
}

export const ScopedModal: React.FunctionComponent<ScopedModalProps> = (
  props,
): JSX.Element => {
  const { BodyWithNetworkCheck } = useNetworkCheck();
  const metamaskInstalled = checkIsWalletInstalled() !== null;

  return (
    <Modal isLoading={props.isLoading} loadingMessage={props.loadingMessage}>
      <ModalHeader>
        <ModalHeaderTitle>{props.title}</ModalHeaderTitle>
        <ModalHeaderClose onClick={props.onClose}>
          <CloseIcon />
        </ModalHeaderClose>
      </ModalHeader>

      {metamaskInstalled ? (
        BodyWithNetworkCheck(
          props.body ? (
            <ModalBody>
              <>
                {props.body}
                <ModalFooter>{props.footer}</ModalFooter>
              </>
            </ModalBody>
          ) : (
            <ModalEmptyBody />
          ),
        )
      ) : (
        <ModalError
          onClick={() => window.open(metamaskUrl)}
          type="noMetaMask"
        />
      )}
    </Modal>
  );
};
