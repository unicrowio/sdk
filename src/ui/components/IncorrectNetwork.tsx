import React from "react";

import ActionForbidden from "../../assets/ActionForbiddenAsset";
import { transformSVGInBase64 } from "../../helpers/transformSVGInBase64";
import { Button } from ".";
import styled from "styled-components";

interface IIncorrectNetworkProps {
  onClick: () => void;
  title?: string;
  description?: string;
  image?: string;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Image = styled.img`
  width: 236px;
  height: 236px;
  margin: 0;
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

export const IncorrectNetwork = ({
  onClick,
  title = "Incorrect Network",
  description = "Please, connect to the network below",
  image = transformSVGInBase64(ActionForbidden),
}: IIncorrectNetworkProps) => {
  return (
    <Container>
      <Image src={image} alt="Wrong network" />
      <Title>{title}</Title>
      <Description>{description}</Description>
      <ButtonContainer>
        <Button fullWidth onClick={onClick}>
          Connect to {globalThis.defaultNetwork.displayName}
        </Button>
      </ButtonContainer>
    </Container>
  );
};
