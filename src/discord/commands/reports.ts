import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { concat } from 'lodash'
import { ReportData, reports } from '../../sheet/reports'
import { villages } from '../../sheet/villages'

import { Command } from '../commands'
import { reportsMessage } from '../messages/reports'
import { closeCommand, parseInteractionCoordinates } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('reports')
  .addStringOption(option =>
    option
      .setName('coordinates')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('player')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(false)
  )
  .setDescription('Get recent reports on village or player')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  if (
    !interaction.options.getString('coordinates') &&
    !interaction.options.getString('player')
  ) {
    closeCommand(interaction, 'Village Coordinates or Player required')
    return
  }
  const village = await parseInteractionCoordinates({
    interaction,
    required: false,
  })
  const player = await parseInteractionCoordinates({
    interaction,
    required: false,
  })
  if (!village && !player) {
    return
  }
  let reportData: ReportData[] = []
  if (player) {
    const villageList = villages.filterByProperties([
      { prop: 'playerId', value: player.id },
    ])
    villageList?.forEach(village => {
      const newReports = reports.filterByProperties([
        { prop: 'villageId', value: village.id },
      ])
      if (newReports) {
        reportData = concat(reportData, newReports)
      }
    })
  }
  if (village) {
    const newReports = reports.filterByProperties([
      { prop: 'villageId', value: village.id },
    ])
    if (newReports) {
      reportData = concat(reportData, newReports)
    }
  }
  const payload = reportsMessage({ reports: reportData, idx: 0 })
  await interaction.editReply(payload)
  return
}

export const reportsList: Command = {
  documentation,
  controller,
}
