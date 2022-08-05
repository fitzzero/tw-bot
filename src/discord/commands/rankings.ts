import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { saveScreenshot } from '../../utility/screenshot'
import { Command } from '../commands'

const playerDocumentation = new SlashCommandBuilder()
  .setName('playertop')
  .setDescription('Top player rankings')

const playerController = async (interaction: CommandInteraction) => {
  await interaction.deferReply()
  const file = await saveScreenshot({
    id: 'playertop',
    url: 'https://usc1.tribalwars.us/guest.php?screen=ranking&mode=player',
    width: 980,
    height: 564,
    clip: { x: 249, y: 284, width: 620, height: 280 },
  })

  interaction.editReply({ files: [file] })
}

export const playerTop: Command = {
  documentation: playerDocumentation,
  controller: playerController,
}
