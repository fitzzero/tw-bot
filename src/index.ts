import { DatabaseEvents } from './db/events'
import { DiscordEvents } from './discord/events'
import { startDiscord } from './discord/connect'
import { startLoop } from './loop'

/* Listen */
DatabaseEvents()
DiscordEvents()

/* Start Services */
startDiscord()
startLoop()
