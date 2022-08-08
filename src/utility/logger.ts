import { botConfig } from '../config'
import { nowString } from './time'

export interface LoggerProps {
  message: string
  prefix?: 'none' | 'alert' | 'success' | 'start' | 'dev'
  logTime?: boolean
}

const prefixIcons = {
  alert: '⚠ ',
  dev: '✎ ',
  success: '✔ ',
  start: '➜ ',
  none: '',
}

export const logDev = (message: any, where?: string) => {
  if (!botConfig.extraLogging) return
  if (where) {
    message = `${where}: ${message}`
  }

  logger({
    prefix: 'dev',
    message,
  })
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
