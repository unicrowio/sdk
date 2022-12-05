import { BUYER, SELLER, countdownChallengePeriod } from '../../helpers'
import React, { useEffect } from 'react'
import { IGetEscrowData } from 'typing'

type CountdownChallengePeriodProps = {
  buttonLabel: string
  disableButton: boolean
  labelChallengePeriod: string
  countdown: string
  shouldWaitOtherParty: boolean
}

export const useCountdownChallengePeriod = (
  escrow: IGetEscrowData | null
): CountdownChallengePeriodProps => {
  const [buttonLabel, setButtonLabel] =
    React.useState<string>('Confirm Challenge')
  const [disableButton, setDisableButton] = React.useState(false)
  const [labelChallengePeriod, setLabelChallengePeriod] =
    React.useState('Challenge Period')
  const [countdown, setCountdown] = React.useState('...')

  const [shouldWaitOtherParty, setShouldWaitOtherParty] = React.useState(false)

  const setupCountdown = (date: Date, periodStarted = true) => {
    const _countdown = countdownChallengePeriod(date)

    if (_countdown === '-') {
      setCountdown('expired')
    } else {
      if (periodStarted) {
        setCountdown(_countdown)
      } else {
        setCountdown(`Starts in ${_countdown.replace(' remaining', '')}`)
      }
    }
  }

  const isExpired = (period: Date) => {
    return countdownChallengePeriod(period) === '-'
  }

  const count = (period: Date, periodStarted: boolean) => {
    const timer = setInterval(() => {
      setupCountdown(period, periodStarted)
    }, 1000)

    return timer
  }

  const setup = (date: Date, periodStarted = true) => {
    setLabelChallengePeriod('Challenge Period')
    setButtonLabel("Challenge period hasn't periodStarted")
    setDisableButton(true)
    const timer = count(date, periodStarted)
    return timer
  }

  const reset = () => {
    setLabelChallengePeriod('Challenge Period')
    setButtonLabel('Challenge period expired')
    setDisableButton(true)
    setCountdown('expired')
  }

  const init = () => {
    setLabelChallengePeriod('Current Challenge Period')
    setButtonLabel && setButtonLabel('Confirm Challenge')
    setDisableButton(false)
    setShouldWaitOtherParty(false)
  }

  useEffect(() => {
    if (!escrow) return

    if (isExpired(escrow.challengePeriodEnd)) {
      reset()
      return
    }

    let timer: NodeJS.Timer

    const isSellerConnected = escrow.connectedUser === SELLER
    const isBuyerConnected = escrow.connectedUser === BUYER

    if (!isSellerConnected && !isBuyerConnected) return

    if (
      (isSellerConnected && !escrow.status.latestChallenge) ||
      (isBuyerConnected && !escrow.status.latestChallenge)
    ) {
      timer = setup(escrow.challengePeriodEnd, true)

      if (isBuyerConnected) {
        init()
      } else if (isSellerConnected) {
        setShouldWaitOtherParty(true)
      }
      return
    }

    if (
      (isSellerConnected && escrow.status.latestChallenge === SELLER) ||
      (isBuyerConnected && escrow.status.latestChallenge === BUYER)
    ) {
      if (!isExpired(escrow.challengePeriodStart)) {
        if (Date.now() > escrow.challengePeriodStart.getTime()) {
          timer = count(escrow.challengePeriodEnd, true)
          setShouldWaitOtherParty(true)
        } else {
          timer = count(escrow.challengePeriodStart, false)
          setShouldWaitOtherParty(true)
        }
      } else {
        timer = count(escrow.challengePeriodEnd, true)
        setShouldWaitOtherParty(true)
      }
      return
    }

    if (
      (isSellerConnected && escrow.status.latestChallenge === BUYER) ||
      (isBuyerConnected && escrow.status.latestChallenge === SELLER)
    ) {
      if (!isExpired(escrow.challengePeriodStart)) {
        if (Date.now() > escrow.challengePeriodStart.getTime()) {
          timer = count(escrow.challengePeriodEnd, true)
          setShouldWaitOtherParty(false)
        } else {
          timer = count(escrow.challengePeriodStart, false)
          setShouldWaitOtherParty(true)
        }
      } else {
        timer = count(escrow.challengePeriodEnd, true)
        setShouldWaitOtherParty(false)
      }
      return
    }

    return () => {
      clearInterval(timer)
    }
  }, [escrow, countdown])

  return {
    buttonLabel,
    disableButton,
    labelChallengePeriod,
    countdown,
    shouldWaitOtherParty
  }
}
