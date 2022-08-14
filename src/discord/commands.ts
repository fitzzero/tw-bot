/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { botConfig } from '../config'
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

export const registerCommands = async () => {
  try {
    const commandDocumentation = activeCommands().map(
      command => command.documentation
    )

    await rest.put(
      Routes.applicationGuildCommands(botConfig.client, botConfig.guild),
      { body: commandDocumentation }
    )
    
    await syncDashboard(commandInfoDashboard)

    logger({ prefix: 'success', message: `Discord: Registered (/) commands` })
    return
  } catch (error) {
    logger({ prefix: 'alert', message: `Discord: ${error}` })
    return
  }
  
}
