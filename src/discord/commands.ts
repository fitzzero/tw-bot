/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { discordConfig } from '../config'
import { VoidFn } from '../types/methods'
import { logger } from '../utility/logger'
const token = process.env.WRTOKEN

const rest = new REST({ version: '9' }).setToken(token || '')

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
]

type Props = {
  dev?: boolean
}

export const registerCommands: VoidFn<Props> = async ({ dev }) => {
  try {
    const guild = dev ? discordConfig.testGuild : discordConfig.guild

    await rest.put(
      Routes.applicationGuildCommands(
        discordConfig.client as any,
        guild as any
      ),
      { body: commands }
    )
    logger({ prefix: 'success', message: `Discord: Registered (/) commands` })
  } catch (error) {
    logger({ prefix: 'alert', message: `Discord: ${error}` })
  }
}
