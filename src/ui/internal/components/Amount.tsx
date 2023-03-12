import { formatAmount } from "../../../helpers/formatAmount";
import React from "react";
import styled from "styled-components";
import { Chip } from "../../../ui/internal/components/Chip";
import Skeleton from "@material-ui/lab/Skeleton";

const Style = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    align-items: center;

    strong {
      font-family: 'Bai Jamjuree';
      font-style: normal;
      font-weight: 700;
      font-size: 44px;
      line-height: 40px;

      color: #252e47;
    }

    span {
      color: #c8cbd0;
      font-family: 'Bai Jamjuree';
      font-style: normal;
      font-weight: 700;
      font-size: 44px;
      line-height: 40px;
      margin-left: 8px;
    }
  }
`;

export interface IAmountProps {
  amount: string;
  tokenSymbol: string;
  status?: string;
  precision?: number;
}

export const Amount = ({
  amount,
  precision,
  tokenSymbol = "ETH",
  status,
}: IAmountProps) => {
  return (
    <Style>
      <div>
        <strong>
          {formatAmount(amount, precision || 18, tokenSymbol || "")}
        </strong>
        {tokenSymbol ? (
          <span>{tokenSymbol}</span>
        ) : (
          <Skeleton
            style={{ display: "inline-block" }} // needed to not wrap the skeleton to a new line
            width={85}
            height={55}
          />
        )}
      </div>
      {status && <Chip>{status}</Chip>}
    </Style>
  );
};
