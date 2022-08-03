import { ButtonInteraction } from 'discord.js'
import { messages } from '../../sheet/messages'
import { todoist } from '../../todoist/connect'
import { getItemById } from '../../todoist/items'
import { Button } from '../buttons'

const handleClose = async (
  interaction: ButtonInteraction,
  complete: boolean
) => {
  await interaction.deferUpdate()
  const messageId = interaction.message.id
  const messageData = messages.getByProperty('messageId', messageId)
  if (!messageData) return
  const todoId = messageData.id.split('-')[1]
  const item = getItemById(todoId)

  if (!todoist || !item) return
  if (complete) {
    await todoist.items.complete({ ...item, date_completed: undefined })
  } else {
    await todoist.items.delete({ ...item })
  }
  await messages.deleteMessage(messageData.id)
}

const handleComplete = async (interaction: ButtonInteraction) => {
  handleClose(interaction, true)
}

const handleDelete = async (interaction: ButtonInteraction) => {
  handleClose(interaction, false)
}

const handleEdit = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
}

export const todoComplete: Button = {
  customId: 'todo-complete',
  controller: handleComplete,
}

export const todoDelete: Button = {
  customId: 'todo-delete',
  controller: handleDelete,
}

export const todoEdit: Button = {
  customId: 'todo-edit',
  controller: handleEdit,
}
