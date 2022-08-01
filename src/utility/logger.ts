import { nowString } from './time'

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
  console.log(
    `${prefixIcons[prefix]}${message}${logTime ? ' ' + nowString() : ''}`
  )
}

export const logSuccess = (message: string, where?: string) => {
  if (where) {
    message = `${where}: ${message}`
  }

  logger({
    prefix: 'success',
    message,
  })
  return
}

export const logAlert = (message: any, where?: string) => {
  if (where) {
    message = `${where}: ${message}`
  }

  logger({
    prefix: 'alert',
    message,
  })
  return
}
