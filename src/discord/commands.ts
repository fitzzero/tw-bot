/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { discordConfig } from '../config'
import { VoidFnProps } from '../types/methods'
import { logger } from '../utility/logger'
import { ping } from './ping'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { todo } from './todo'

const token = process.env.WRTOKEN

const rest = new REST({ version: '9' }).setToken(token || '')

export type CommandFn = (interaction: Interaction) => Promise<void>

export interface Command {
  documentation: SlashCommandBuilder
  controller: CommandFn
}

export const activeCommands = [ping, todo]

type Props = {
  dev?: boolean
}

export const registerCommands: VoidFnProps<Props> = async ({ dev }) => {
  try {
    const guild = dev ? discordConfig.testGuild : discordConfig.guild

    const commandDocumentation = activeCommands.map(
      command => command.documentation
    )

    await rest.put(
      Routes.applicationGuildCommands(
        discordConfig.client as any,
        guild as any
      ),
      { body: commandDocumentation }
    )
    logger({ prefix: 'success', message: `Discord: Registered (/) commands` })
  } catch (error) {
    logger({ prefix: 'alert', message: `Discord: ${error}` })
  }
}
