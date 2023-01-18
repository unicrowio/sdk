import React from "react";
import { ActionForbidden } from "../assets/ActionForbidden";
import { Button } from ".";
import styled from "styled-components";

interface IModalErrorProps {
  type: 'noMetaMask' | 'wrongNetwork';
  onClick: VoidFunction;
  error?: Record<'title' | 'buttonTitle' | 'description', string>;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: 700;
  margin-bottom: 0px;
`;

const Description = styled.p`
  max-width: 318px;
  font-size: 16px;
  color: #c4c4c4;
  margin-bottom: 24px;
  margin-top: 0;
  text-align: center;
  line-height: 22.4px;
`;

const ButtonContainer = styled.div`
  max-width: 232px;
  width: 100%;
`;

export const ModalError = ({
  type,
  onClick,
  error,
}: IModalErrorProps) => {
  const errors = {
    noMetaMask: {
      title: "No wallet installed",
      buttonTitle: "Install MetaMask",
      description: "Please, install MetaMask, the most popular web3 wallet",
    },
    wrongNetwork: {
      title: "Incorrect Network",
      buttonTitle: `Connect to ${globalThis.defaultNetwork.displayName}`,
      description: "Please, connect to the network below",
    },
  };

  const { title, buttonTitle, description } = error || errors[type];

  return (
    <Container>
      <ActionForbidden />
      <Title>{title}</Title>
      <Description>{description}</Description>
      <ButtonContainer>
        <Button fullWidth onClick={onClick}>
          {buttonTitle}
        </Button>
      </ButtonContainer>
    </Container>
  );
};
