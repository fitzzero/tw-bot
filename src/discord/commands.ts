/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { botConfig, publicConfig } from '../config'
import { logger } from '../utility/logger'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { syncDashboard } from './dashboard'
import { commandInfoDashboard } from './dashboardMessages/commands'

const token = process.env.WRTOKEN

const rest = new REST({ version: '9' }).setToken(token || '')

export interface Command {
  documentation: SlashCommandBuilder
  controller: (interaction: CommandInteraction) => Promise<void>
}

export const activeCommands = (): Command[] => botConfig.commands

export const publicCommands = (): Command[] => publicConfig.commands

export const registerCommands = async () => {
  try {
    const commandDocumentation = activeCommands().map(
      command => command.documentation
    )

    const publicDocumentation = publicCommands().map(
      command => command.documentation
    )

    await rest.put(
      Routes.applicationGuildCommands(botConfig.client, botConfig.guild),
      { body: commandDocumentation }
    )

    for (const guildId of publicConfig.guilds) {
      await rest.put(
        Routes.applicationGuildCommands(botConfig.client, guildId),
        { body: publicDocumentation }
      )
    }

    await syncDashboard(commandInfoDashboard)

    logger({ prefix: 'success', message: `Discord: Registered (/) commands` })
    return
  } catch (error) {
    logger({ prefix: 'alert', message: `Discord: ${error}` })
    return
  }
}
