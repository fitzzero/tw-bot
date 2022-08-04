import { SlashCommandBuilder } from '@discordjs/builders'
import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js'
import { Item } from 'todoist/dist/v8-types'
import { channels, WarRoomChannels } from '../../sheet/channels'
import { todoist } from '../../todoist/connect'
import { getActiveProject } from '../../todoist/project'
import { logger } from '../../utility/logger'
import { wait } from '../../utility/wait'
import { cannedResponses } from '../canned'
import { Command } from '../commands'
import { syncTodoDashboard } from '../dashboardMessages/todo'

const documentation = new SlashCommandBuilder()
  .setName('todo')
  .addStringOption(option =>
    option
      .setName('what')
      .setDescription('Name or Description of what to do')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('when')
      .setDescription('When you want it done in Server Time')
      .setRequired(true)
  )
  .setDescription('Add a new todo item')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  const what = interaction.options.getString('what')
  const when = interaction.options.getString('when')
  const project = getActiveProject()
  if (!what || !when) {
    cannedResponses.error(interaction)
    return
  }
  await interaction.deferReply()

  try {
    const newItem = (await todoist?.items.add({
      content: what,
      project_id: project?.id,
      // Problem with 'todoist' Type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      due: { string: when } as any,
    })) as Item
    const success = await syncTodoDashboard(newItem)
    if (success) {
      const todoChannelData = channels.getById(WarRoomChannels.todo)
      if (interaction.channelId == todoChannelData?.channelId) {
        interaction.deleteReply()
      } else {
        await interaction.editReply(
          `New <#${todoChannelData?.channelId}> added`
        )
      }
    } else {
      closeCommand(interaction)
    }
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `Todoist: ${err}` })
    await closeCommand(interaction)
  }
}

export const closeCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.editReply('Something went wrong, closing command...')
  await wait(5000)
  await interaction.deleteReply()
}

export const todo: Command = {
  documentation,
  controller,
}
