import React from 'react'
import styled from 'styled-components'
import { Chip } from '../../ui/components/Chip'
import { formatAmount } from '../../helpers/formatAmount'

const Style = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
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
`

export interface IAmountProps {
  amount: string
  tokenSymbol: string
  status?: string
  precision?: number
}

export const Amount = (props: IAmountProps) => {
  return (
    <Style>
      <div>
        <strong>
          {formatAmount(props.amount, props.precision || 18, props.tokenSymbol)}
        </strong>
        <span>{props.tokenSymbol}</span>
      </div>
      {props.status && <Chip>{props.status}</Chip>}
    </Style>
  )
}
