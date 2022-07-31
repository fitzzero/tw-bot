import moment from 'moment-timezone'

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

export const logger = ({ message, logTime, prefix = 'none' }: LoggerProps) => {
  const timeString = ` (${moment
    .tz('America/New_York')
    .format('MMMM Do YYYY, HH:mm:ss')})`
  console.log(`${prefixIcons[prefix]}${message}${logTime ? timeString : ''}`)
}

export const logSuccess = (message: string, where?: string): void => {
  if (where) {
    message = `${where}: ${message}`
  }

  logger({
    prefix: 'success',
    message,
  })
  return
}

export const logAlert = (message: string, where?: string): void => {
  if (where) {
    message = `${where}: ${message}`
  }

  logger({
    prefix: 'alert',
    message,
  })
  return
}
