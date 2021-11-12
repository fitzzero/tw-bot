/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { discordConfig } from '../config'
import { PromiseFn } from '../@types/methods'
import { logger } from '../utility/logger'
import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders'
import { Interaction } from 'discord.js'

const token = process.env.WRTOKEN

const rest = new REST({ version: '9' }).setToken(token || '')

export type CommandFn = (interaction: Interaction) => Promise<void>

export interface Command {
  documentation: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  controller: CommandFn
}

export const activeCommands = (): Command[] => discordConfig().commands

export const registerCommands: PromiseFn<void, void> = async () => {
  try {
    const commandDocumentation = activeCommands().map(
      command => command.documentation
    )

    await rest.put(
      Routes.applicationGuildCommands(
        discordConfig().client as any,
        discordConfig().guild.id as any
      ),
      { body: commandDocumentation }
    )
    logger({ prefix: 'success', message: `Discord: Registered (/) commands` })
    return
  } catch (error) {
    logger({ prefix: 'alert', message: `Discord: ${error}` })
    return
  }
}
