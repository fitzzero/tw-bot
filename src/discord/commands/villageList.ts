import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { concat, isEmpty } from 'lodash'
import { VillageData, villages } from '../../sheet/villages'
import { getPlayerUrl } from '../../tw/player'
import { getTribeUrl } from '../../tw/tribe'
import { logAlert } from '../../utility/logger'
import { Command } from '../commands'
import {
  closeCommand,
  parseInteractionPlayer,
  parseInteractionTribe,
} from './canned'

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
  .setDescription('Get full list of villages')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const tribe = await parseInteractionTribe({ interaction, required: false })
  const player = await parseInteractionPlayer({ interaction, required: false })
  if (!tribe && !player) {
    return
  }
  let villageList: VillageData[] = []
  if (tribe) {
    const newVillages = villages.getByTribeId(tribe.id)
    if (newVillages) villageList = concat(villageList, newVillages)
  }
  if (player) {
    const newVillages = villages.filterByProperties([
      { prop: 'playerId', value: player.id },
    ])
    if (newVillages) villageList = concat(villageList, newVillages)
  }

  if (isEmpty(villageList)) {
    closeCommand(interaction, `No villages found`)
    return
  }

  let coordsPage: string[] = []
  villageList.forEach((village, idx) => {
    // Reply with 200 villages per message
    const page = Math.ceil((idx + 1) / 200) - 1
    const coords = `${village.x}|${village.y}`
    if (!coordsPage[page]) coordsPage[page] = coords
    else coordsPage[page] += ` ${coords}`
  })

  try {
    let content = ''
    if (tribe) {
      const url = getTribeUrl(tribe.id)
      content += `[${tribe.name} [${tribe.tag}]](<${url}>)`
    }
    if (tribe && player) content += ' + '
    if (player) content += `[${player.name}](<${getPlayerUrl(player.id)}>)`
    content += ' villages:'
    await interaction.editReply(content)
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
