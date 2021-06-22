export interface LoggerProps {
  message: string
  prefix?: 'none' | 'alert' | 'success'
}

const prefixIcons = {
  alert: '⚠ ',
  success: '✔ ',
  none: '',
}

export const logger = ({ message, prefix = 'none' }: LoggerProps): void => {
  console.log(`${prefixIcons[prefix]}${message}`)
}
