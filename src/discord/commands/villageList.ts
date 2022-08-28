import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { concat } from 'lodash'
import { players } from '../../sheet/players'
import { tribes } from '../../sheet/tribes'
import { VillageData, villages } from '../../sheet/villages'
import { logAlert } from '../../utility/logger'
import { Command } from '../commands'
import { closeCommand } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('villages')
  .addStringOption(option =>
    option
      .setName('tribe')
      .setDescription('Get villages by tribe tag')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('player')
      .setDescription('Get villages by player name')
      .setRequired(false)
  )
  .setDescription('Generate a fake script')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const tribe = interaction.options.getString('tribe')
  const player = interaction.options.getString('player')
  if (!tribe && !player) {
    closeCommand(interaction, 'Requires either a tribe or player')
    return
  }
  let villageList: VillageData[] = []
  if (tribe) {
    const tribeData = tribes.getByProperty('tag', tribe)
    if (!tribeData) {
      closeCommand(interaction, `Tribe with tag '${tribe}' not found`)
      return
    }
    const newVillages = villages.getByTribeId(tribeData.id)
    if (newVillages) villageList = concat(villageList, newVillages)
  }
  if (player) {
    const playerData = players.getByProperty('name', player)
    if (!playerData) {
      closeCommand(interaction, `Player with name '${player}' not found`)
      return
    }
    const newVillages = villages.filterByProperties([
      { prop: 'playerId', value: playerData.id },
    ])
    if (newVillages) villageList = concat(villageList, newVillages)
  }

  let coordsPage: string[] = []
  villageList.forEach((village, idx) => {
    // Reply with 200 villages per message
    const page = Math.ceil(idx + 1 / 200)
    const coords = `${village.x}|${village.y}`
    if (!coordsPage[page]) coordsPage[page] = coords
    else coordsPage[page] += ` ${coords}`
  })

  try {
    await interaction.deleteReply()
    for (const coords of coordsPage) {
      await interaction.channel?.send(`\`\`\`${coords}\`\`\``)
    }
  } catch (err) {
    logAlert(err, 'Discord fake command')
    closeCommand(interaction)
  }
  return
}

export const villageList: Command = {
  documentation,
  controller,
}
