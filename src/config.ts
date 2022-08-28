import { ping } from './discord/commands/ping'
import { todo } from './discord/commands/todo'
import { Command } from './discord/commands'
import { village } from './discord/commands/village'
import {
  playerOd,
  playerOda,
  playerOdd,
  playerTop,
  tribeOd,
  tribeOda,
  tribeOdd,
  tribeTop,
} from './discord/commands/rankings'
import { map } from './discord/commands/map'
import { online } from './discord/commands/online'
import { tribe } from './discord/commands/tribe'
import { villageList } from './discord/commands/villageList'
import { MessageTrigger } from './discord/messageTrigger'
import { twReport } from './discord/messageEvents/twReport'

export const isDev = !!process.argv[2]

export const storagePath = 'https://fitzzero.sirv.com/tribalwars/tw-bot/'

interface BotConfig {
  category: string
  client: string
  commands: Command[]
  coreDoc: string
  coreGuild: string
  guild: string
  triggers: MessageTrigger[]
  writeEnabled: boolean
  extraLogging: boolean
}

const devDiscordConfig: BotConfig = {
  category: '1008956038411726909',
  client: '896860363541348413',
  commands: [
    ping,
    todo,
    village,
    map,
    playerTop,
    playerOd,
    playerOda,
    playerOdd,
    tribeTop,
    tribeOd,
    tribeOda,
    tribeOdd,
    online,
    tribe,
    villageList,
  ],
  coreDoc: '1HyUhgkPs5SIRWQU4a2VrLjz9z8Uku437riwp-S0xS90',
  coreGuild: '1008955953024077825',
  triggers: [twReport],
  guild: '1008955953024077825',
  writeEnabled: true,
  extraLogging: true,
}

const prodDiscordConfig: BotConfig = {
  category: '904857595272114240',
  client: '896860363541348413',
  commands: [
    todo,
    village,
    map,
    playerTop,
    playerOd,
    playerOda,
    playerOdd,
    tribeTop,
    tribeOd,
    tribeOda,
    tribeOdd,
    online,
    tribe,
    villageList,
  ],
  coreDoc: '11q2LsofJBmaP_PKJt8W5eHhY2MwT3hvylNvlvzPQgQI',
  coreGuild: '1008955953024077825',
  triggers: [twReport],
  guild: '855057085719642134',
  writeEnabled: true,
  extraLogging: false,
}

export const botConfig = isDev ? devDiscordConfig : prodDiscordConfig

export const publicConfig = {
  commands: [village],
  triggers: [twReport],
  guilds: ['620484161974566922'],
}
