import moment from 'moment-timezone'
import { Moment } from 'moment'

export const withinLastDay = (date?: Moment) => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'day')
}

export const withinLastHour = (date?: Moment) => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'hour')
}

export const withinLastMinute = (date?: Moment) => {
  if (!moment.isMoment(date)) return false
  return !!date.isSame(moment.tz('America/New_York'), 'minute')
}

export const getUnix = (time?: Moment) => {
  if (time) return time.tz('America/New_York').unix()
  return moment.tz('America/New_York').unix()
}

export const nowString = () => {
  return moment().tz('America/New_York').format('MMMM Do YYYY, HH:mm:ss')
}
