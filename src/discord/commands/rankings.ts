import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { saveScreenshot } from '../../utility/screenshot'
import { Command } from '../commands'
import { worldPath } from '../../tw/world'
import { isDev } from '../../config'

/*
 * Top Players
 */

const playerDocumentation = new SlashCommandBuilder()
  .setName('playertop')
  .setDescription('Top player rankings')

const playerController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'playertop',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=player`,
    width: 980,
    height: 564,
    clip: { x: 249, y: 284, width: 620, height: 280 },
  })

  interaction.editReply({ files: [file.path] })
}

export const playerTop: Command = {
  documentation: playerDocumentation,
  controller: playerController,
}

/*
 * Top Tribes
 */

const tribeDocumentation = new SlashCommandBuilder()
  .setName('tribetop')
  .setDescription('Top tribe rankings')

const tribeController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'tribetop',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=ally`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 284, width: 620, height: 293 },
  })

  interaction.editReply({ files: [file.path] })
}

export const tribeTop: Command = {
  documentation: tribeDocumentation,
  controller: tribeController,
}

/*
 * Tribe OD
 */

const tribeOdDocumentation = new SlashCommandBuilder()
  .setName('tribeod')
  .setDescription('Tribe OD rankings')

const tribeOdController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'tribeod',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_ally&type=all`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const tribeOda: Command = {
  documentation: tribeOdDocumentation,
  controller: tribeOdController,
}

/*
 * Tribe ODA
 */

const tribeOdaDocumentation = new SlashCommandBuilder()
  .setName('tribeoda')
  .setDescription('Tribe OD as attacker rankings')

const tribeOdaController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'tribeoda',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_ally&type=att`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const tribeOd: Command = {
  documentation: tribeOdaDocumentation,
  controller: tribeOdaController,
}

/*
 * Tribe ODD
 */

const tribeOddDocumentation = new SlashCommandBuilder()
  .setName('tribeodd')
  .setDescription('Tribe OD as defender rankings')

const tribeOddController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'tribeodd',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_ally&type=def`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const tribeOdd: Command = {
  documentation: tribeOddDocumentation,
  controller: tribeOddController,
}

/*
 * Player OD
 */

const playerOdDocumentation = new SlashCommandBuilder()
  .setName('playerod')
  .setDescription('Player OD rankings')

const playerOdController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'playerod',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_player&type=all`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const playerOd: Command = {
  documentation: playerOdDocumentation,
  controller: playerOdController,
}

/*
 * Player ODA
 */
const playerOdaDocumentation = new SlashCommandBuilder()
  .setName('playeroda')
  .setDescription('Player OD as attacker rankings')

const playerOdaController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'playeroda',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_player&type=att`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const playerOda: Command = {
  documentation: playerOdaDocumentation,
  controller: playerOdaController,
}

/*
 * Player ODD
 */
const playerOddDocumentation = new SlashCommandBuilder()
  .setName('playerodd')
  .setDescription('Player OD as defender rankings')

const playerOddController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'playerodd',
    url: `${worldPath(
      isDev ? 'c1' : undefined
    )}guest.php?screen=ranking&mode=kill_player&type=def`,
    width: 980,
    height: 577,
    clip: { x: 249, y: 163, width: 620, height: 414 },
  })

  interaction.editReply({ files: [file.path] })
}

export const playerOdd: Command = {
  documentation: playerOddDocumentation,
  controller: playerOddController,
}
