/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import {
  discordConfig,
  discordDevCommands,
  discordProdCommands,
  isDev,
} from '../config'
import { VoidFn } from '../types/methods'
import { logger } from '../utility/logger'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'

const token = process.env.WRTOKEN

const rest = new REST({ version: '9' }).setToken(token || '')

export type CommandFn = (interaction: Interaction) => Promise<void>

export interface Command {
  documentation: SlashCommandBuilder
  controller: CommandFn
}

export const activeCommands = isDev ? discordDevCommands : discordProdCommands

export const registerCommands: VoidFn = async () => {
  try {
    const guild = isDev ? discordConfig.testGuild : discordConfig.guild

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
