import Discord from 'discord.js'
import { connect } from './db/connect'
import { logger } from './utility/logger'
const token = process.env.ELOTOKEN
const dbConnection = process.env.ELODB

const client = new Discord.Client()

client.on('ready', () => {
  logger({ prefix: 'success', message: 'Client Started' })
  if (dbConnection) {
    connect(dbConnection)
  } else
    logger({ prefix: 'alert', message: 'Database Connection String Missing' })
})

client.login(token)
