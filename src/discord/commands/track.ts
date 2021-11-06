import { SlashCommandBuilder } from '@discordjs/builders'
import { createTracker } from '../../db/tracker/trackerController'
import {
  TrackerTypesArray,
  TrackerTypes,
  TrackerData,
} from '../../@types/tracker'
import { Command, CommandFn } from '../commands'

const documentation = new SlashCommandBuilder()
  .setName('track')
  .setDescription('Village Trackers')

TrackerTypesArray.forEach(trackerType => {
  documentation.addSubcommand(subcommand =>
    subcommand
      .setName(trackerType)
      .setDescription(`Add new ${trackerType} target`)
      .addStringOption(option =>
        option
          .setName('village')
          .setDescription('village coordinates ie 123|456')
      )
      .addStringOption(option =>
        option.setName('player').setDescription('player name')
      )
      .addStringOption(option =>
        option.setName('tribe').setDescription('tribe name')
      )
  )
})

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return

  const subCommand = interaction.options.getSubcommand() as TrackerTypes
  if (!subCommand) {
    interaction.reply('Requires sub command')
    return
  }
  const village = interaction.options.getString('village')
  const player = interaction.options.getString('player')
  const tribe = interaction.options.getString('tribe')
  const targetId = village || player || tribe

  if (!targetId) {
    interaction.reply('Requires a target')
    return
  }

  const newTrackerData: TrackerData = {
    discord: {},
    history: [],
    type: subCommand,
    targetId,
    targetType: village ? 'village' : player ? 'player' : 'tribe',
  }

  await createTracker(newTrackerData)
  interaction.reply(`Added ${targetId} as a new ${subCommand} target`)
}

export const track: Command = {
  documentation,
  controller,
}
