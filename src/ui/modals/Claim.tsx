import React from 'react'
import {
  IBalanceWithTokenInfo,
  IClaimModalProps,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  ITokenInfo
} from '../../typing'
import { StyledButton, Table, ScopedModal, Symbol } from '../../ui/components'
import { useModalStates } from '../../ui/hooks/useModalStates'
import { toast } from '../components/notification/toast'
import { claim, getTokenInfo } from '../../core'
import {
  displayableAmountBN,
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates
} from '../../helpers'

type IBalanceWithTokenUSD = IBalanceWithTokenInfo & {
  amountInUSD?: string
}

export function ClaimModal(props: IClaimModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    onModalClose
  } = useModalStates({ deferredPromise: props.deferredPromise })

  const claimCallbacks: IClaimTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true)
      setLoadingMessage('Connecting')
      props.callbacks?.connectingWallet && props.callbacks.connectingWallet()
    },
    connected: () => {
      setLoadingMessage('Connected')
      props.callbacks?.connected && props.callbacks.connected()
    },
    broadcasting: () => {
      setLoadingMessage('Waiting for approval')
      props.callbacks?.broadcasting && props.callbacks.broadcasting()
    },
    broadcasted: (payload: IClaimTransactionPayload) => {
      props.callbacks?.broadcasted && props.callbacks.broadcasted(payload)
      setLoadingMessage('Waiting confirmation')
    },
    confirmed: (payload: IClaimTransactionPayload) => {
      props.callbacks?.confirmed && props.callbacks.confirmed(payload)

      toast('Claimed', 'success')

      setSuccess(payload.transactionHash)
      setIsLoading(false)
    }
  }

  const onHandleMultipleClaim = () => {
    claim(props.walletsToClaim, claimCallbacks).catch(e => {
      setIsLoading(false)
      toast(e, 'error')
    })
  }

  const renderReadyForClaim = React.useCallback(() => {
    return props.balances.readyForClaim.map((balance: IBalanceWithTokenUSD) => {
      const [rowTokenInfo, setRowTokenInfo] = React.useState<ITokenInfo>()
      const [tokenInfoLoading, setTokenInfoLoading] =
        React.useState<boolean>(false)

      React.useEffect(() => {
        setTokenInfoLoading(true)
        getTokenInfo(balance.token)
          .then(setRowTokenInfo)
          .finally(() => {
            setTokenInfoLoading(false)
          })

        getExchangeRates([balance.symbol!]).then(exchangeValues => {
          const symbol = balance.symbol as string
          const exchangeValue = exchangeValues[symbol]

          if (exchangeValue) {
            balance.amountInUSD = formatAmountToUSD(
              balance.amountBN,
              exchangeValue
            )
          } else {
            balance.amountInUSD = 'n/a (error)'
          }
        })
      }, [])

      if (tokenInfoLoading) {
        return (
          <tr key={`balance-${balance.tokenAddress}`}>
            <td>Loading...</td>
          </tr>
        )
      }

      if (!rowTokenInfo) {
        return (
          <tr key={`balance-${balance.token}`}>
            <td>Error while loading Token Info</td>
          </tr>
        )
      }

      return (
        <tr key={`balance-${balance.token}`}>
          <td>
            {displayableAmountBN(balance.total, rowTokenInfo.decimals).toFixed(
              displayDecimals(balance.symbol!)
            )}{' '}
            <Symbol>{rowTokenInfo.symbol}</Symbol>
          </td>
          <td>
            {'$'}
            {balance.amountInUSD}
          </td>
        </tr>
      )
    })
  }, [props.balances.readyForClaim])

  const ModalBody = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>{renderReadyForClaim()}</tbody>
      </Table>
    )
  }

  const ModalFooter = () => {
    let buttonChildren
    let buttonOnClick

    if (!error && !success) {
      buttonChildren = `Confirm`
      buttonOnClick = onHandleMultipleClaim
    } else if (success) {
      buttonChildren = 'Close'
      buttonOnClick = onModalClose
    } else {
      buttonChildren = 'Retry'
      buttonOnClick = onHandleMultipleClaim
    }

    return (
      <StyledButton
        fullWidth
        disabled={isLoading || props.balances.readyForClaim.length === 0}
        onClick={buttonOnClick}
      >
        {buttonChildren}
      </StyledButton>
    )
  }

  return (
    <ScopedModal
      title={
        props.balances.readyForClaim.length > 1
          ? 'Claim Balances'
          : 'Claim Payment'
      }
      body={<ModalBody />}
      footer={<ModalFooter />}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  )
}
