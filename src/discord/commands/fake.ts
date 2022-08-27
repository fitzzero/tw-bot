import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { merge } from 'lodash'
import { players } from '../../sheet/players'
import { tribes } from '../../sheet/tribes'
import { VillageData, villages } from '../../sheet/villages'
import { logAlert } from '../../utility/logger'
import { Command } from '../commands'
import { closeCommand } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('fake')
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
    if (newVillages) villageList = merge(villageList, newVillages)
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
    if (newVillages) villageList = merge(villageList, newVillages)
  }

  let coords = ''
  for (const village of villageList) {
    coords += `${village.x}|${village.y} `
  }
  coords = coords.slice(0, -1)
  const message = `\`\`\`javascript:coords='${coords}'; var doc=document;if(window.frames.length>0 && window.main!=null)doc=window.main.document;url=doc.URL;if(url.indexOf('screen=place')==-1)alert('Use the script in the rally point page!');coords=coords.split(' ');index=Math.round(Math.random()*(coords.length-1));coords=coords[index];coords=coords.split('|');doc.forms[0].x.value=coords[0];doc.forms[0].y.value=coords[1];$('#place_target').find('input').val(coords[0]+'|'+coords[1]);doc.forms[0].ram.value=1;doc.forms[0].spy.value=0;end();\`\`\``

  try {
    await interaction.editReply(message)
  } catch (err) {
    logAlert(err, 'Discord fake command')
    closeCommand(interaction)
  }
  return
}

export const fake: Command = {
  documentation,
  controller,
}
