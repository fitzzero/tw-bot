import { logger } from '../utility/logger'
import { discord } from './connect'

export const DiscordEvents = (): void => {
  discord.on('ready', () => {
    logger({
      prefix: 'success',
      message: `Discord: Connected as ${discord.user?.username}`,
    })
  })
}
