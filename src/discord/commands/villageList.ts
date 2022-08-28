import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { concat, isEmpty } from 'lodash'
import { PlayerData, players } from '../../sheet/players'
import { TribeData, tribes } from '../../sheet/tribes'
import { VillageData, villages } from '../../sheet/villages'
import { getPlayerUrl } from '../../tw/player'
import { getTribeUrl } from '../../tw/tribe'
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
  .setDescription('Get full list of villages')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  const tribe = interaction.options.getString('tribe')
  const player = interaction.options.getString('player')
  if (!tribe && !player) {
    closeCommand(interaction, 'Requires either a tribe or player')
    return
  }
  let villageList: VillageData[] = []
  let foundTribe: TribeData | undefined = undefined
  let foundPlayer: PlayerData | undefined = undefined
  if (tribe) {
    foundTribe = tribes.getByProperty('tag', tribe)
    if (!foundTribe) {
      closeCommand(interaction, `Tribe with tag '${tribe}' not found`)
      return
    }
    const newVillages = villages.getByTribeId(foundTribe.id)
    if (newVillages) villageList = concat(villageList, newVillages)
  }
  if (player) {
    foundPlayer = players.getByProperty('name', player)
    if (!foundPlayer) {
      closeCommand(interaction, `Player with name '${player}' not found`)
      return
    }
    const newVillages = villages.filterByProperties([
      { prop: 'playerId', value: foundPlayer.id },
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
    if (foundTribe) {
      const url = getTribeUrl(foundTribe.id)
      content += `[${foundTribe.name} [${foundTribe.tag}]](<${url}>)`
    }
    if (foundTribe && foundPlayer) content += ' + '
    if (foundPlayer)
      content += `[${foundPlayer.name}](<${getPlayerUrl(foundPlayer.id)}>)`
    content += ' villages:'
    await interaction.reply(content)
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
