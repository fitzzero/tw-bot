import { DatabaseEvents } from './db/events'
import { DiscordEvents } from './discord/events'
import { startDiscord } from './discord/connect'
import { startLoop } from './loop'
import { logger } from './utility/logger'
const isDev: string = process.argv[2]

if (!isDev)
  logger({ prefix: 'success', message: 'Bot: Starting in Production' })
else logger({ prefix: 'success', message: 'Bot: Starting in Develop' })

/* Listen */
DatabaseEvents()
DiscordEvents()

/* Start Services */
startDiscord(!!isDev)
startLoop(!!isDev)
