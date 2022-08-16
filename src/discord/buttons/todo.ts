import { ButtonInteraction, MessageOptions } from 'discord.js'
import { channels, WRChannels } from '../../sheet/channels'
import { messages } from '../../sheet/messages'
import { todoist } from '../../todoist/connect'
import { getItemById } from '../../todoist/items'
import { Button } from '../buttons'
import { WRColors } from '../colors'
import { closeCommand } from '../commands/canned'
import { syncTodoDashboard } from '../dashboardMessages/todo'
import { todoModal } from '../modals/editTodo'

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
  // Action Complete
  if (complete) {
    const completeMessage: MessageOptions = {
      content: '',
      embeds: [
        {
          color: WRColors.success,
          description: `<@${interaction.user.id}> completed: ~~${item.content}~~`,
        },
      ],
      components: [],
    }
    const newsChannel = channels.getById(WRChannels.news)
    await todoist.items.close({ ...item })
    const newItem = getItemById(todoId)
    // If issue or out of channel, simply complete the task
    if (!newItem || interaction.channelId != newsChannel?.channelId) {
      await todoist.items.complete({ ...item, date_completed: undefined })
      await messages.deleteMessage(messageData.id)
      return
    }
    // If item archived (completed) update message
    if (newItem?.checked) {
      await interaction.editReply(completeMessage)
      await messages.removeById(messageData.id)
      return
    }
    // Item not in history (reoccuring task)
    // Re-sync message and post receipt
    else {
      await channels.sendMessage(WRChannels.news, completeMessage)
      await syncTodoDashboard(newItem)
    }
  }
  // Action: Delete
  else {
    await todoist.items.delete({ ...item })
    await messages.deleteMessage(messageData.id)
  }
}

const handleComplete = async (interaction: ButtonInteraction) => {
  handleClose(interaction, true)
}

const handleDelete = async (interaction: ButtonInteraction) => {
  handleClose(interaction, false)
}

const handleEdit = async (interaction: ButtonInteraction) => {
  const modal = todoModal.modalBuilder(interaction)
  if (!modal) {
    closeCommand(interaction)
    return
  }
  await interaction.showModal(modal)
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

export const todoRefresh: Button = {
  customId: 'todo-refresh',
  controller: handleEdit,
}
