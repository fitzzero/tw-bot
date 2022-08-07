import moment from 'moment-timezone'
import { Moment } from 'moment'

export const momentStringFormat = 'MMMM Do YYYY, HH:mm:ss'
export const momentTimeZone = 'America/New_York'
export const momentUtcOffset = '-0400'

export const withinLastDay = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'day')
}

export const withinLastHour = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'hour')
}

export const withinLastMinute = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return !!date.isSame(moment.tz(momentTimeZone), 'minute')
}

export const getUnix = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return moment.tz(momentTimeZone).unix()
  return date.tz(momentTimeZone).unix()
}

export const getIso = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return moment.tz(momentTimeZone).toISOString()
  return date.tz(momentTimeZone).toISOString()
}

export const getMinutesSince = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return moment.tz(momentTimeZone).diff(date, 'minutes')
}

export const getHoursSince = (date?: Moment | string) => {
  date = validateMoment(date)
  if (!date) return
  return moment.tz(momentTimeZone).diff(date, 'hours')
}

export const nowString = () => {
  return moment().tz(momentTimeZone).format(momentStringFormat)
}

export const validateMoment = (date?: Moment | string) => {
  if (!date) return
  if (typeof date === 'string') {
    date = moment(date, momentStringFormat).utcOffset(momentUtcOffset, true)
  }
  if (!moment.isMoment(date)) return
  return date
}

export const minToDuration = (totalMinutes: number) => {
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`
}

export const padTo2Digits = (num: number) => {
  return num.toString().padStart(2, '0')
}
