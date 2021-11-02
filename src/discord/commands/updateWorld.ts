import { SlashCommandBuilder } from '@discordjs/builders'
import { getVillage } from '../../db/village/villageController'
import { patchWorld } from '../../db/world/worldDb'
import { Coordinate, UpdateWorld } from '../../types/world'
import { Command, CommandFn } from '../commands'

const documentation = new SlashCommandBuilder()
  .setName('updateworld')
  .addStringOption(option =>
    option
      .setName('start')
      .setDescription('Update the center x|y coordinates')
      .setRequired(false)
  )
  .addNumberOption(option =>
    option
      .setName('radius')
      .setDescription('Radius to include for village alerts')
      .setRequired(false)
  )
  .setDescription('Updates properties of the world')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  // Get Properties
  const startString = interaction.options.getString('start')
  const radius = interaction.options.getNumber('radius')

  if (!startString && !radius) {
    await interaction.reply('No properties added to update')
    return
  }

  const updateData: UpdateWorld = {}

  if (startString) {
    const args = startString.split('|')
    if (!args[1]) {
      await interaction.reply('Error parsing start coordinates')
      return
    }
    const start: Coordinate = {
      x: parseInt(args[0]) || 0,
      y: parseInt(args[1]) || 0,
    }
    updateData.start = start
  }

  if (radius) updateData.radius = radius

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

  await interaction.reply(reply)
  return
}

export const updateWorld: Command = {
  documentation,
  controller,
}
