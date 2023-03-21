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
import { Forbidden } from "./Forbidden";
import { ModalBodySkeleton } from "./ModalBodySkeleton";
import { stopAsync } from "../hooks/useAsync";

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
  const { isForbidden = false, reason } = props.modalAction || {};
  const [bodyIsEmpty, setBodyIsEmpty] = React.useState(true);

  React.useEffect(() => {
    return () => stopAsync();
  }, []);

  React.useEffect(() => {
    // fancy way of checking whether a component is empty / returning null
    const bodyContent = React.Children.toArray(props.body)[0] as any;

    setBodyIsEmpty([null, false, undefined].includes(bodyContent?.type()));
  }, [props?.body]);

  const BodyWithFooter = React.useCallback(
    () =>
      WithNetworkCheck(
        <>
          {isForbidden && (
            <Forbidden description={reason} onClose={props.onClose} />
          )}

          {!isForbidden && (
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
    [props.body, props.footer, WithNetworkCheck, isForbidden, reason, bodyIsEmpty],
  );

  return (
    <Modal isLoading={props.isLoading} loadingMessage={props.loadingMessage}>
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
