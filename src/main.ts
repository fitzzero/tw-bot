import Discord from 'discord.js'
import { logger } from './utility/logger'
const token = process.env.discoelo

const client = new Discord.Client()

client.on('ready', () => {
  logger({ message: 'Client Started' })
})

client.login(token)
