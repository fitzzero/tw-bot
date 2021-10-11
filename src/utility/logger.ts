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

/*
 * (text: string): array
 */
export const parseCsv = (text: string): any => {
  const lines = text.split('\n')
  const data = lines.map(function (lin) {
    return lin.split(',')
  })
  return data
}
