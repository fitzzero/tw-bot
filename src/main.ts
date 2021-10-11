import Discord from 'discord.js'
import { connection } from 'mongoose'
import { connectDb } from './db/connect'
import { startLoop } from './loop'
import { logger } from './utility/logger'
const token = process.env.WRTOKEN
const dbConnection = process.env.WRDB
const discord = new Discord.Client()

interface Status {
  discord: boolean
  database: boolean
}

const status: Status = {
  discord: false,
  database: false,
}

discord.on('ready', () => {
  status.discord = true
  logger({
    prefix: 'success',
    message: `Discord: Connected as ${discord.user?.username}`,
  })
})

connection.on('open', () => {
  status.database = true
  logger({ prefix: 'success', message: 'Database: Connected' })
  startLoop()
})

/* Connect To Services */
discord.login(token)
if (dbConnection) connectDb(dbConnection)
else {
  logger({
    prefix: 'alert',
    message: 'Database: Database Connection String Missing',
  })
}
