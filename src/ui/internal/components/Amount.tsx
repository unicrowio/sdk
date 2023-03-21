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

// TODO pass the entire tokenInfo instead of each prop
export interface IAmountProps {
  amount: string;
  tokenSymbol: string;
  tokenAddress?: string; // todo remove this prop
  status?: string;
  precision?: number;
}

export const Amount = ({
  amount,
  precision,
  tokenSymbol = "ETH",
  tokenAddress,
  status,
}: IAmountProps) => {
  return (
    <Style>
      <div>
        <strong>
          {formatAmount(amount, precision || 18, tokenSymbol || "")}
        </strong>
        {tokenSymbol && <span>{tokenSymbol}</span>}

        {
          // if tokenAddress is defined but tokenSymbol is not == we are loading the token info
          tokenAddress && !tokenSymbol && (
            <Skeleton
              style={{ display: "inline-block" }} // needed to not wrap the skeleton to a new line
              width={85}
              height={55}
            />
          )
        }
      </div>
      {status && <Chip>{status}</Chip>}
    </Style>
  );
};
