/**
 *  Format Date to Day, minutes and seconds
 *
 * @example
 *  difference > day :
 *    1 day / x days
 *
 *  hour > difference < day:
 *    1 hour / x hours
 *
 *  minute > difference < hour:
 *    1 min / x min
 *
 *  difference < minute:
 *    0
 *
 * @returns {string} - Formatted time
 */
export function formatDuration(seconds: number) {
  const deadline = new Date(seconds * 1000)
  const now = new Date()
  const deltaTimeMilliseconds = deadline.getTime() - now.getTime()

  // 1000(millisecond) * 60(sec) * 60(min) * 24(hours)
  const dayMilliseconds = 86400

  // 1000(millisecond) * 60(sec) * 60(min)
  const hoursMilliseconds = 3600

  // 1000(millisecond) * 60(sec)
  const minMilliseconds = 60

  let formattedString = null
  if (deltaTimeMilliseconds >= dayMilliseconds) {
    const diffDays = Math.round(deltaTimeMilliseconds / dayMilliseconds)
    formattedString = `${diffDays} ${diffDays > 1 ? 'days' : 'day'}`
  } else if (deltaTimeMilliseconds >= hoursMilliseconds) {
    const diffHours = Math.floor(deltaTimeMilliseconds / hoursMilliseconds)
    formattedString = `${diffHours} ${diffHours > 1 ? 'hours' : 'hour'}`
  } else if (deltaTimeMilliseconds >= minMilliseconds) {
    const diffMinutes = Math.floor(deltaTimeMilliseconds / minMilliseconds)
    formattedString = `${diffMinutes} ${diffMinutes > 1 ? 'minutes' : 'minute'}`
  } else {
    formattedString = `0 days`
  }

  return formattedString
}
