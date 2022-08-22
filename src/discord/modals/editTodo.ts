import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import moment from 'moment'
import { messages } from '../../sheet/messages'
import { todoist } from '../../todoist/connect'
import { getItemById } from '../../todoist/items'
import { logAlert } from '../../utility/logger'
import { momentUtcOffset, withinLastMinute } from '../../utility/time'
import { closeCommand } from '../commands/canned'
import { syncTodoDashboard } from '../dashboardMessages/todo'
import { sendItemCompleteReceipt } from '../messages/todoComplete'
import { Modal } from '../modals'

const controller = async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply()
  const messageId = interaction.customId.split('-')[2]
  const refresh = interaction.customId.split('-')[3]
  const data = getData(messageId)
  if (!data || !todoist) {
    closeCommand(interaction)
    return
  }

  const date = moment(data.item?.due?.date).utcOffset(momentUtcOffset, true)
  const upcoming = date.isAfter() && !withinLastMinute(date)

  // Update values
  data.item.content = interaction.fields.getTextInputValue('todo-content')
  const newDueString = interaction.fields.getTextInputValue('todo-due')
  if (newDueString != data.item.due.string || !upcoming) {
    data.item.due.string = newDueString
    data.item.due.date = ''
  }
  // Update item and sync
  try {
    await todoist.items.update({
      ...data.item,
      day_order: undefined,
    })
  } catch (err) {
    logAlert(err, 'Todoist: Item Update')
    closeCommand(interaction)
    return
  }
  console.log(refresh)
  if (refresh === 'true') {
    await sendItemCompleteReceipt({ item: data.item, interaction })
  }

  const updatedItem = getItemById(`${data.item.id}`)
  if (!updatedItem) {
    return
  }
  syncTodoDashboard(updatedItem, !upcoming)
  await interaction.deleteReply()
}

export const modalBuilder = (interaction: ButtonInteraction) => {
  const data = getData(interaction.message.id)
  const refresh = interaction.customId === 'todo-refresh'
  if (!data) {
    closeCommand(interaction)
    return
  }

  const modal = new ModalBuilder()
    .setCustomId(`edit-todo-${data.messageData.messageId}-${refresh}`)
    .setTitle('Edit Todo')

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
