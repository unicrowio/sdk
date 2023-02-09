import React from "react";
import styled from "styled-components";
import { QuestionMarkerIcon } from "../assets/QuestionMarkerIcon";

const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1;
  
  svg {
    font-size: 14px;
    margin-top: -6px;
  }

  span {
    word-wrap: break-word;
    white-space: pre;
    visibility: hidden;
    display: inline-block;
    min-width: 100px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 8px;
    padding: 5px 5px;

    /* Position the tooltip */
    position: absolute;

    bottom: 100%;
    left: 50%;
    margin-left: -50px;
    margin-bottom: 5px;
  }

    span::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50px;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

  :hover span {
    visibility: visible;
  }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

export const Marker = ({ text, ...rest }: Props) => {
  return (
    <Tooltip {...rest}>
      <QuestionMarkerIcon />
      <span>{text}</span>
    </Tooltip>
  );
};
