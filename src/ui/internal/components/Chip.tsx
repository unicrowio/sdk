import React, { ReactNode } from "react";
import styled from "styled-components";

type ChipWrapperProps = {
  color: string;
  children: ReactNode;
};

const ChipWrapper = styled.div<ChipWrapperProps>`
  height: 36px;
  display: flex;
  align-items: center;
  margin-left: 10px;
  border-radius: 4px;
  justify-content: center;

  background: ${(props: ChipWrapperProps) => props.color};
`;

type ChipContentProps = {
  color: string;
};

const ChipContent = styled.div<ChipContentProps>`
  padding: 6px 10px;

  font-family: 'Bai Jamjuree';
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;

  letter-spacing: -0.03em;

  color: ${(props: ChipContentProps) => props.color};
`;

export interface IChipProps {
  children: string;
}

const getType = (type: string) => {
  const _type = type.trim().toLowerCase();
  const SUCCESS = ["paid", "released"];
  const DANGER = [
    "unpaid",
    "challenged by buyer",
    "challenged by seller",
    "challenged by you",
  ];
  if (SUCCESS.includes(_type)) {
    return { bg: "#E6F9EB", text: "#03C239" };
  }
  if (DANGER.includes(_type)) {
    return { bg: "#FFD0CC", text: "#ED6855" };
  }

  return { bg: "#F0F0F0", text: "#000000" };
};

export const Chip = (props: IChipProps) => {
  const color = getType(props.children);

  return (
    <ChipWrapper color={color.bg}>
      <ChipContent color={color.text}>{props.children}</ChipContent>
    </ChipWrapper>
  );
};
