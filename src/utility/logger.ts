export interface LoggerProps {
  message: string
  alert?: boolean
}

export const logger = ({ message }: LoggerProps): void => {
  console.log(message)
}
