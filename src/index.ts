import { DiscordEvents } from './discord/events'
import { startLoop } from './loop'
import { logger } from './utility/logger'
import { isDev } from './config'
import { startDiscord } from './discord/connect'
import { nowString } from './utility/time'

export const BotInfo = {
  version: '1.9',
  started: nowString(),
}

if (isDev)
  logger({ prefix: 'success', message: `v${BotInfo.version} starting in Dev` })
else
  logger({ prefix: 'success', message: `v${BotInfo.version} starting in Prod` })

/* Listen */
DiscordEvents()

/* Start Services */
startDiscord()
startLoop()
