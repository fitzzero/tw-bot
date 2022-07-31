import moment from 'moment-timezone'
import { Moment } from 'moment'

export const momentStringFormat = 'MMMM Do YYYY, HH:mm:ss ZZ'
export const momentTimeZone = 'America/New_York'

export const withinLastDay = (dateString?: string) => {
  if (!dateString) return false
  const date = moment(dateString, momentStringFormat)
  return !!date.isSame(moment.tz(momentTimeZone), 'day')
}

export const withinLastHour = (dateString?: string) => {
  if (!dateString) return false
  const date = moment(dateString, momentStringFormat)
  return !!date.isSame(moment.tz(momentTimeZone), 'hour')
}

export const withinLastMinute = (dateString?: string) => {
  if (!dateString) return false
  const date = moment(dateString, momentStringFormat)
  return !!date.isSame(moment.tz(momentTimeZone), 'minute')
}

export const getUnix = (time?: Moment) => {
  if (time) return time.tz(momentTimeZone).unix()
  return moment.tz(momentTimeZone).unix()
}

export const nowString = () => {
  return moment().tz(momentTimeZone).format(momentStringFormat)
}
