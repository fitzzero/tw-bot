import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, CommandFn } from '../commands'
import { hasAdmin } from '../../db/account/accountController'
import { cannedResponses } from '../canned'
import { getActiveWorld } from '../../db/world/worldController'
import { syncTw } from '../../tw/tribalWars'

const documentation = new SlashCommandBuilder()
  .setName('sync')
  .addBooleanOption(option =>
    option
      .setName('tribal-wars')
      .setDescription('Sync Tribal Wars Data')
      .setRequired(true)
  )
  .setDescription('Admin command to re-run syncs')

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return

  if (!hasAdmin(interaction.user.id)) {
    cannedResponses.requiresAdmin(interaction)
    return
  }

  const tribalWars = interaction.options.getBoolean('tribal-wars')
  if (tribalWars) {
    const world = getActiveWorld()
    if (!world) {
      cannedResponses.error(interaction)
      return
    }
    syncTw({ world })
    await interaction.reply({ content: 'Started TW Sync' })
  }
}

export const sync: Command = {
  documentation,
  controller,
}
