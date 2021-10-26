import { DatabaseEvents } from './db/events'
import { DiscordEvents } from './discord/events'
import { startDiscord } from './discord/connect'
import { startLoop } from './loop'
import { logger } from './utility/logger'
import { isDev } from './config'

if (isDev) logger({ prefix: 'success', message: 'Bot: Starting in Develop' })
else logger({ prefix: 'success', message: 'Bot: Starting in Production' })

/* Listen */
DatabaseEvents()
DiscordEvents()

/* Start Services */
startDiscord()
startLoop()
