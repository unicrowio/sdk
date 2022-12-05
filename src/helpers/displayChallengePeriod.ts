import { DateTime } from 'luxon'

type IDiff = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const formatDate = (diff: IDiff): string => {
  const { days, hours, minutes, seconds } = diff

  let formattedString = '-'

  if (days > 0) {
    formattedString = `${days} ${days === 1 ? 'day' : 'days'} ${
      hours > 0 ? hours : ''
    } ${hours > 0 ? (hours === 1 ? 'hour' : 'hours') : ''}`
  } else if (hours > 0) {
    formattedString = `${hours} ${hours === 1 ? 'hour' : 'hours'} ${
      minutes > 0 ? minutes : ''
    } ${minutes > 0 ? (minutes === 1 ? 'minute' : 'minutes') : ''}`
  } else if (minutes > 0) {
    formattedString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${
      seconds > 0 ? seconds : ''
    } ${seconds > 0 ? (seconds === 1 ? 'second' : 'seconds') : ''}`
  } else if (seconds > 0) {
    formattedString = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
  } else {
    formattedString = '-'
  }

  return formattedString
}

export const displayChallengePeriod = (challengePeriod: number): string => {
  if (challengePeriod <= 0) {
    return '-'
  }

  const now = DateTime.now()
  const period = now.plus({ seconds: challengePeriod })

  const diff = period.diff(now, ['days', 'hours', 'minutes', 'seconds'])

  return formatDate(diff)
}
