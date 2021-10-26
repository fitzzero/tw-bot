import moment from 'moment-timezone'
import { VoidFnProps } from '../types/methods'

export interface LoggerProps {
  message: string
  prefix?: 'none' | 'alert' | 'success' | 'start'
  logTime?: boolean
}

const prefixIcons = {
  alert: '⚠ ',
  success: '✔ ',
  start: '➜ ',
  none: '',
}

export const logger: VoidFnProps<LoggerProps> = async ({
  message,
  logTime,
  prefix = 'none',
}) => {
  const timeString = ` (${moment.tz('America/New_York').toString()})`
  console.log(`${prefixIcons[prefix]}${message}${logTime ? timeString : ''}`)
}
