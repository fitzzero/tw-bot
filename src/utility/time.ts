import moment from 'moment-timezone'
import { Moment } from 'moment'

export const withinLastDay = (date?: Moment): boolean => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'day')
}

export const withinLastHour = (date?: Moment): boolean => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'hour')
}

export const withinLastMinute = (date?: Moment): boolean => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'minute')
}

export const currentUnix = (): number => {
  return moment.tz('America/New_York').unix()
}
