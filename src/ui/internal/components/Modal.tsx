import React, { ReactNode } from "react";

import styled from "styled-components";
import { CloseIcon } from "../assets/CloseIcon";
import { Loading } from "./Loading";

export const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  z-index: 999999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  background: rgba(233, 234, 237, 0.7);
`;

export const StyledModalContent = styled.div`
  background-color: #fdfcff;

  min-width: 486px;
  max-width: 802px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;

  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.06);
  border-radius: 24px;

  padding: 32px;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseIconWrapper = styled.div`
  cursor: pointer;
`;

export const ModalHeaderTitle = styled.div`
  font-family: 'Bai Jamjuree';
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;
  color: #444c5e;
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: 24px;
  min-height: 100px;
`;

export const ModalEmptyBody = styled(ModalBody)`
  flex: 1;
  min-height: 360px;
`;

export const ModalFooter = styled.footer`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

export const ModalLoading = styled.div`
  position: fixed;
  z-index: 99999999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  filter: opacity(95%);
  background: rgba(233, 234, 237, 0.7);
`;

export const ModalLoadingMessage = styled.p`
  z-index: 999;

  font-family: 'Bai Jamjuree';
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;

  color: #6259ff;

  text-align: center;
`;

export interface TModalProps {
  isLoading?: boolean;
  loadingMessage?: string;
  children?: ReactNode;
}

export const Modal = ({
  isLoading = false,
  loadingMessage = "",
  children,
}: TModalProps) => {
  return (
    <ModalWrapper>
      <StyledModalContent>
        <>
          {children}
          {isLoading && (
            <ModalLoading>
              <div>
                <Loading />
                <ModalLoadingMessage>{loadingMessage}</ModalLoadingMessage>
              </div>
            </ModalLoading>
          )}
        </>
      </StyledModalContent>
    </ModalWrapper>
  );
};

export const ModalHeaderClose = ({ ...props }) => (
  <CloseIconWrapper {...props}>
    <CloseIcon />
  </CloseIconWrapper>
);
