import { SlashCommandBuilder } from '@discordjs/builders'
import { todoist } from '../todoist/connect'
import { getActiveProject } from '../todoist/project'
import { Command, CommandFn } from './commands'

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
    await interaction.reply('Error!')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newItem = await todoist?.items.add({
    content: what,
    project_id: project?.id,
    due: { string: when } as any,
  })

  await interaction.reply(`Created ${what}`)
}

export const todo: Command = {
  documentation,
  controller,
}
