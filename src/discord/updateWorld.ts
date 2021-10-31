import { SlashCommandBuilder } from '@discordjs/builders'
import { getVillage } from '../db/villageController'
import { patchWorld } from '../db/worldDb'
import { Coordinate, UpdateWorld } from '../types/world'
import { Command, CommandFn } from './commands'

const documentation = new SlashCommandBuilder()
  .setName('updateworld')
  .addStringOption(option =>
    option
      .setName('start')
      .setDescription('Update the center x|y coordinates')
      .setRequired(false)
  )
  .setDescription('Updates properties of the world')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  const startString = interaction.options.getString('start')
  if (!startString) {
    await interaction.reply('No properties added to update')
    return
  }

  const updateData: UpdateWorld = {
    start: undefined,
  }

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

  const world = await patchWorld(updateData)

  if (!world) {
    await interaction.reply('Something went wrong')
    return
  }

  let reply = ''
  if (updateData.start) {
    const villageId = `${updateData.start.x}|${updateData.start.y}`
    reply += `Updated starting coordinates to ${villageId}`
    const village = await getVillage(villageId)
    if (village) {
      reply += ` (${village.name})`
    }
  }

  await interaction.reply(reply)
  return
}

export const updateWorld: Command = {
  documentation,
  controller,
}
