import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { messages } from '../../sheet/messages'
import { todoist } from '../../todoist/connect'
import { getItemById } from '../../todoist/items'
import { closeCommand } from '../commands/canned'
import { syncTodoDashboard } from '../dashboardMessages/todo'
import { Modal } from '../modals'

const controller = async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply()
  const messageId = interaction.customId.split('-')[2]
  const data = getData(messageId)
  if (!data || !todoist) {
    closeCommand(interaction)
    return
  }
  // Update values
  data.item.content = interaction.fields.getTextInputValue('todo-content')
  const newDueString = interaction.fields.getTextInputValue('todo-due')
  if (newDueString != data.item.due.string) {
    data.item.due.string = newDueString
    data.item.due.date = ''
  }
  // Update item and sync
  await todoist.items.update({
    ...data.item,
    day_order: undefined,
  })

  const updatedItem = getItemById(`${data.item.id}`)
  if (!updatedItem) {
    closeCommand(interaction)
    return
  }
  syncTodoDashboard(updatedItem, false)
  await interaction.deleteReply()
}

export const modalBuilder = (interaction: ButtonInteraction) => {
  const data = getData(interaction.message.id)
  if (!data) {
    closeCommand(interaction)
    return
  }

  const modal = new ModalBuilder()
    .setCustomId(`edit-todo-${data.messageData.messageId}`)
    .setTitle('Manage Incoming Origins')

  const rows = [
    textRow({ id: 'todo-content', label: 'What:', value: data.item.content }),
    textRow({ id: 'todo-due', label: 'When:', value: data.item.due.string }),
  ]

  modal.addComponents(rows)
  return modal
}

const getData = (messageId: string) => {
  const messageData = messages.getByProperty('messageId', messageId)
  if (!messageData) return
  const todoId = messageData.id.split('-')[1]
  const item = getItemById(todoId)
  if (!item) return

  return { item: item, messageData: messageData }
}

const textRow = ({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) => {
  const input: TextInputBuilder = new TextInputBuilder()
    .setCustomId(id)
    .setValue(value)
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)

  return new ActionRowBuilder<TextInputBuilder>().addComponents(input)
}

export const todoModal: Modal = {
  customId: 'edit-todo-',
  modalBuilder,
  controller,
}
