import { VoidFnProps } from '../types/methods'
import { discord } from './connect'

export interface DiscordAlertProps {
  message: string
}

export const discordAlert: VoidFnProps<DiscordAlertProps> = async ({
  message,
}) => {
  discord.
}
