import { DiscordEvents } from './discord/events'
import { startLoop } from './loop'
import { logger } from './utility/logger'
import { isDev } from './config'
import { startDiscord } from './discord/connect'

export const version = '1.0'

if (isDev) logger({ prefix: 'success', message: `v${version} starting in Dev` })
else logger({ prefix: 'success', message: `v${version} starting in Prod` })

/* Listen */
DiscordEvents()

/* Start Services */
startDiscord()
startLoop()
