import moment, { Moment } from 'moment'
export const withinLastHour = (date: Moment): boolean => {
  return !!date.isSame(moment(), 'hour')
}
