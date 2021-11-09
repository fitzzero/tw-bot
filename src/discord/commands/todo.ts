import { SlashCommandBuilder } from '@discordjs/builders'
import moment from 'moment-timezone'
import { Item } from 'todoist/dist/v8-types'
import { todoist } from '../../todoist/connect'
import { getActiveProject } from '../../todoist/project'
import { logger } from '../../utility/logger'
import { tryCatch } from '../../utility/try'
import { wait } from '../../utility/wait'
import { cannedResponses } from '../canned'
import { Command, CommandFn } from '../commands'

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

const controller: CommandFn = async interaction => {
  if (!interaction.isCommand()) return
  const what = interaction.options.getString('what')
  const when = interaction.options.getString('when')
  const project = getActiveProject()
  if (!what || !when) {
    cannedResponses.error(interaction)
    return
  }
  await cannedResponses.loading(interaction)

  try {
    const newItem = (await todoist?.items.add({
      content: what,
      project_id: project?.id,
      // Problem with 'todoist' Type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      due: { string: when } as any,
    })) as Item

    const due = moment.tz(newItem?.due?.date, 'America/New_York').unix()
    await tryCatch({
      tryFn: () =>
        interaction.editReply(
          `Created **${newItem?.content}** at <t:${due}> (<t:${due}:R>)`
        ),
      name: 'Discord todo:',
    })
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `Todoist: ${err}` })
    await interaction.editReply('Something went wrong, closing command...')
    await wait(5000)
    await interaction.deleteReply()
  }
}

export const todo: Command = {
  documentation,
  controller,
}
