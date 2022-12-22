import React, { ReactNode } from "react";
import {
  Modal,
  ModalBody,
  ModalEmptyBody,
  ModalFooter,
  ModalHeader,
  ModalHeaderClose,
  ModalHeaderTitle,
} from "../../ui/components/Modal";
import { CloseIcon } from "../../ui/components/icons/Close";

type ScopedModalProps = {
  title: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  isLoading: boolean;
  loadingMessage: string;
  onClose?: () => any;
};

export const ScopedModal: React.FunctionComponent<ScopedModalProps> = (
  props,
): JSX.Element => {
  return (
    <Modal isLoading={props.isLoading} loadingMessage={props.loadingMessage}>
      <ModalHeader>
        <ModalHeaderTitle>{props.title}</ModalHeaderTitle>
        <ModalHeaderClose onClick={props.onClose}>
          <CloseIcon />
        </ModalHeaderClose>
      </ModalHeader>

      {props.body ? (
        <ModalBody>
          {props.body}
          <ModalFooter>{props.footer}</ModalFooter>
        </ModalBody>
      ) : (
        <ModalEmptyBody />
      )}
    </Modal>
  );
};
