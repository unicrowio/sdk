import React from 'react'
import {
  ISettlementTransactionPayload,
  ISettlementApproveTransactionCallbacks,
  ISettlementApproveModalProps,
  ISettlementOfferModalProps,
  ISettlementOfferTransactionCallbacks,
  IGetEscrowData,
  ApproveSettlementParsedPayload
} from '../../typing'
import {
  Subtitle,
  Amount,
  Symbol,
  StyledButton,
  ScopedModal
} from '../../ui/components'
import { useModalStates } from '../../ui/hooks/useModalStates'
import { toast } from '../components/notification/toast'
import styled from 'styled-components'
import { approveSettlement, getEscrowData } from '../../core'
import {
  ContainerDataDisplayer,
  DataDisplayer
} from '../components/DataDisplayer'
import { renderModal } from '..'
import { displayableAmount } from '../../helpers/displayAmount'
import { BUYER, SELLER } from '../../helpers/constants'
import { SettlementOfferModal } from './SettlementOffer'
import { Forbidden } from '../components/Forbidden'

import { MARKER } from '../../config/marker'

const ContainerButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
  margin-top: -28px;
`
const LabelFees = styled.p`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;

  color: #c4c4c4;
`

export function ApproveSettlementModal(props: ISettlementApproveModalProps) {
  const { escrowData, escrowId, callbacks, deferredPromise } = props
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose
  } = useModalStates({ deferredPromise })

  const [escrow, setEscrow] = React.useState<IGetEscrowData | null>(null)

  const labelAmountSplit = React.useMemo(() => {
    if (escrow && escrow?.settlement) {
      const _splitBuyer = escrow.settlement.latestSettlementOfferBuyer / 100
      const _splitSeller = escrow.settlement.latestSettlementOfferSeller / 100

      const _amountBuyer = escrow.amount.times(_splitBuyer)
      const _amountSeller = escrow.amount.times(_splitSeller)

      const _amountBuyerDisplayable = displayableAmount(
        _amountBuyer,
        escrow.token.decimals
      )

      const _sellerBuyerDisplayable = displayableAmount(
        _amountSeller,
        escrow.token.decimals
      )

      return {
        buyer: {
          amount: _amountBuyerDisplayable,
          symbol: escrow.token.symbol,
          percentage: escrow.settlement.latestSettlementOfferBuyer
        },

        seller: {
          amount: _sellerBuyerDisplayable,
          symbol: escrow.token.symbol,
          percentage: escrow.settlement.latestSettlementOfferSeller
        }
      }
    }
    return null
  }, [escrow])

  const title = React.useMemo(() => {
    if (escrow && escrow.settlement && escrow.connectedUser) {
      if (
        escrow.connectedUser === BUYER &&
        escrow.status.latestSettlementOffer === BUYER
      ) {
        return 'Settlement Offered by You'
      } else if (
        escrow.connectedUser === SELLER &&
        escrow.status.latestSettlementOffer === SELLER
      ) {
        return 'Settlement Offered by You'
      } else if (
        escrow.connectedUser === BUYER &&
        escrow.status.latestSettlementOffer !== BUYER
      ) {
        return 'Settlement Offered by Seller'
      } else if (
        escrow.connectedUser === SELLER &&
        escrow.status.latestSettlementOffer !== SELLER
      ) {
        return 'Settlement Offered by Buyer'
      }
    }
    return null
  }, [escrow])

  const [labelBuyer, labelSeller] = React.useMemo(() => {
    if (escrow?.connectedUser === BUYER) {
      return ['You will get back', 'Seller will receive']
    }

    return ['Buyer will get back', 'You will receive']
  }, [escrow])

  const displayActionButtons = React.useMemo(() => {
    return escrow?.status.latestSettlementOffer !== escrow?.connectedUser
  }, [escrow])

  React.useEffect(() => {
    if (escrowData) {
      setEscrow(escrowData)
      return
    }

    setIsLoading(true)
    setLoadingMessage('Getting Escrow information')
    getEscrowData(escrowId)
      .then((data: IGetEscrowData) => {
        if (!data.settlement) {
          throw new Error('There is no settlement to this escrow')
        }
        setEscrow(data)
      })
      .catch(e => {
        toast(e, 'error')
        onModalClose()
      })
      .finally(() => {
        setLoadingMessage('')
        setIsLoading(false)
      })
  }, [])

  const approveSettlementOfferCallbacks: ISettlementApproveTransactionCallbacks =
    {
      connectingWallet: () => {
        setIsLoading(true)
        setLoadingMessage('Connecting')
        callbacks?.connectingWallet && callbacks.connectingWallet()
      },
      broadcasting: () => {
        setLoadingMessage('Waiting for approval')
        callbacks?.broadcasting && callbacks.broadcasting()
      },
      broadcasted: (payload: ISettlementTransactionPayload) => {
        callbacks?.broadcasted && callbacks.broadcasted(payload)
        setLoadingMessage('Waiting confirmation')
      },
      confirmed: (payload: ApproveSettlementParsedPayload) => {
        callbacks?.confirmed && callbacks.confirmed(payload)

        toast('Accepted', 'success')

        setSuccess(payload.transactionHash)
        setIsLoading(false)
      }
    }

  const onAcceptClick = React.useCallback(() => {
    if (escrow && escrowId) {
      approveSettlement(
        escrowId,
        escrow?.settlement!.latestSettlementOfferBuyer,
        escrow?.settlement!.latestSettlementOfferSeller,
        approveSettlementOfferCallbacks
      ).catch(e => {
        setIsLoading(false)
        toast(e, 'error')
      })
    }
  }, [escrowId, escrow])

  const ModalBody = React.useCallback(() => {
    if (!escrow) {
      return null
    }

    if (!isLoading && ![BUYER, SELLER].includes(escrow.connectedUser)) {
      return <Forbidden onClose={onModalClose} />
    }

    return (
      <>
        <Amount
          precision={escrow.token.decimals}
          amount={displayableAmount(escrow.amount, escrow.token.decimals)}
          tokenSymbol={escrow.token?.symbol ? escrow.token.symbol : '...'}
        />

        <Subtitle>Settlement Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label={labelBuyer}
            value={
              <span>
                {labelAmountSplit?.buyer.amount}{' '}
                <Symbol>{labelAmountSplit?.buyer.symbol}</Symbol> (
                {labelAmountSplit?.buyer.percentage}%)
              </span>
            }
            marker={MARKER.buyer}
          />
          <DataDisplayer
            label={labelSeller}
            value={
              <span>
                {labelAmountSplit?.seller.amount}{' '}
                <Symbol>
                  {labelAmountSplit?.seller.symbol}
                  {escrow.connectedUser === SELLER && '*'}
                </Symbol>{' '}
                ({labelAmountSplit?.seller.percentage}%)
              </span>
            }
            marker={MARKER.seller}
          />
          {escrow.connectedUser === SELLER && (
            <LabelFees>
              * Fees will be deducted proportionally from your share
            </LabelFees>
          )}
        </ContainerDataDisplayer>
      </>
    )
  }, [labelSeller, labelBuyer, labelAmountSplit])

  const openNegotiateModal = async () => {
    onModalClose()

    if (escrow) {
      const settlementModalProps: ISettlementOfferModalProps = {
        escrowId,
        escrowData: escrow,
        deferredPromise,
        callbacks: callbacks as ISettlementOfferTransactionCallbacks
      }
      renderModal(SettlementOfferModal, settlementModalProps)
    }
  }

  const ModalFooter = React.useCallback(() => {
    if (!escrow) {
      return null
    }
    if (success || escrow.status.claimed) {
      return (
        <ContainerButtons>
          <StyledButton fullWidth variant="primary" onClick={onModalClose}>
            Close
          </StyledButton>
        </ContainerButtons>
      )
    }
    return displayActionButtons ? (
      <>
        <ContainerButtons>
          <StyledButton
            fullWidth
            variant="secondary"
            onClick={openNegotiateModal}
          >
            Negotiate
          </StyledButton>
          <StyledButton
            variant="primary"
            disabled={isLoading}
            fullWidth
            onClick={onAcceptClick}
          >
            Accept
          </StyledButton>
        </ContainerButtons>
      </>
    ) : (
      <ContainerButtons>
        <StyledButton
          fullWidth
          variant="secondary"
          onClick={openNegotiateModal}
        >
          Change
        </StyledButton>
        <StyledButton fullWidth variant="primary" onClick={onModalClose}>
          Close
        </StyledButton>
      </ContainerButtons>
    )
  }, [displayActionButtons, isLoading, escrow])

  return (
    <ScopedModal
      title={title}
      body={escrow ? <ModalBody /> : null}
      footer={escrow ? <ModalFooter /> : null}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  )
}
