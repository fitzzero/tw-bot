import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders'
import { getVillage } from '../../db/village/villageController'
import { patchWorld } from '../../db/world/worldController'
import { Coordinate, WorldEditProps } from '../../@types/world'
import { loadActiveMessage } from '../active'
import { Command, CommandFn } from '../commands'

const documentation: SlashCommandSubcommandsOnlyBuilder =
  new SlashCommandBuilder()
    .setName('updateworld')
    .setDescription('Update active world settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('radius')
        .setDescription('Adjust the start radius of the world')
        .addNumberOption(option =>
          option
            .setName('radius')
            .setDescription('Size of radius from start')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Set starting coordinate of the world')
        .addNumberOption(option =>
          option.setName('x').setDescription('X coordinate').setRequired(true)
        )
        .addNumberOption(option =>
          option.setName('y').setDescription('Y coordinate').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('roles')
        .setDescription('Add world roles')
        .addRoleOption(option =>
          option
            .setName('browser')
            .setDescription('Role for browser player')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName('app')
            .setDescription('Role for app player')
            .setRequired(true)
        )
    )

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  // Get Properties
  const subCommand = interaction.options.getSubcommand()
  const radius = interaction.options.getNumber('radius')
  const x = interaction.options.getNumber('x')
  const y = interaction.options.getNumber('y')

  if (!['start', 'roles', 'radius'].includes(subCommand)) {
    await interaction.reply('No properties added to update')
    return
  }

  const updateData: WorldEditProps = {}

  if (x && y) {
    const start: Coordinate = { x, y }
    updateData.start = start
  }

  if (radius) updateData.radius = radius

  if (interaction.options.getSubcommand() === 'roles') {
    const browserRoleId = interaction.options.getRole('browser')
    const appRoleId = interaction.options.getRole('app')
    if (!browserRoleId || !appRoleId) return
    updateData.roles = {
      app: appRoleId.id,
      browser: browserRoleId.id,
    }
  }

  const world = await patchWorld(updateData)

  if (!world) {
    await interaction.reply('Something went wrong')
    return
  }

  let reply = `Updated ${world.name} settings`
  if (updateData.start) {
    const villageId = `${updateData.start.x}|${updateData.start.y}`
    reply += `\nSet starting coordinates to ${villageId}`
    const village = await getVillage(villageId)
    if (village) {
      reply += ` (${village.name})`
    }
  }
  if (updateData.radius) {
    reply += `\nSet alert radius to: ${updateData.radius}`
  }
  if (updateData.roles) {
    reply += `\nAdded <@&${updateData.roles.app}> (App) and <@&${updateData.roles.browser}> (Browser)`
    loadActiveMessage()
  }

  await interaction.reply(reply)
  return
}

export const updateWorld: Command = {
  documentation,
  controller,
}
