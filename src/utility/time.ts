import moment from 'moment-timezone'
import { Moment } from 'moment'

export const momentStringFormat = 'MMMM Do YYYY, HH:mm:ss'
export const sheetsStringFormat = 'M/D HH:mm:ss'
export const momentTimeZone = 'America/New_York'
export const momentUtcOffset = '-0500'

/* Format date as string */
export const formatDate = (date: Moment) => {
  return date.tz(momentTimeZone).format(momentStringFormat)
}

/* Get time in Unix (Discord Timestamp) */
export const getUnix = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return moment.tz(momentTimeZone).unix()
  return date.tz(momentTimeZone).unix()
}

/* Get time in ISO (Discord Footer) */
export const getIso = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return moment.tz(momentTimeZone).toISOString()
  return date.tz(momentTimeZone).toISOString()
}

/* Minutes since date */
export const getMinutesSince = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return moment.tz(momentTimeZone).diff(date, 'minutes')
}

/* Hours since date */
export const getHoursSince = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return moment.tz(momentTimeZone).diff(date, 'hours')
}

/* Min to 00:00 Duration */
export const minToDuration = (totalMinutes: number) => {
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`
}

/* Now in string format */
export const nowString = () => {
  return moment().tz(momentTimeZone).format(momentStringFormat)
}

export const padTo2Digits = (num: number) => {
  return num.toString().padStart(2, '0')
}

/* Convert string to moment if needed */
export const validateMoment = (date?: Moment | string) => {
  if (!date) return
  if (typeof date === 'string') {
    date = moment(date, momentStringFormat).utcOffset(momentUtcOffset, true)
  }
  if (!moment.isMoment(date)) return
  return date
}

/* Check if date is today */
export const withinLastDay = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'day')
}

/* Check if date is this hour */
export const withinLastHour = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'hour')
}

/* Check if date is this minute */
export const withinLastMinute = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'minute')
}
