import moment from 'moment-timezone'
import { Moment } from 'moment'

export const withinLastHour = (date: Moment): boolean => {
  return !!date.isSame(moment.tz('America/New_York'), 'hour')
}

export const withinLastMinute = (date: Moment): boolean => {
  return !!date.isSame(moment.tz('America/New_York'), 'minute')
}
