import { DatabaseEvents } from './db/events'
import { DiscordEvents } from './discord/events'
import { startLoop } from './loop'
import { logger } from './utility/logger'
import { isDev } from './config'

const version = '21-11-9'

if (isDev) logger({ prefix: 'success', message: `v${version} starting in Dev` })
else logger({ prefix: 'success', message: 'v${version} starting in Prod' })

/* Listen */
DatabaseEvents()
DiscordEvents()

/* Start Services */
startLoop()
