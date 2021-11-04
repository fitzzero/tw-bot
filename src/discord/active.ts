import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js'
import {
  addDashboardMessage,
  getActiveWorld,
} from '../db/world/worldController'
import { Fn, PromiseFn } from '../types/methods'
import { getDashboardChannel } from './dashboard'

let message: Message | undefined = undefined

export const loadActiveMessage: PromiseFn<void, void> = async () => {
  const key = 'active'
  const world = getActiveWorld()
  if (!world?.roles) return

  const channel = await getDashboardChannel()
  if (!channel) return

  const dashboard = world?.dashboard?.find(message => message.key === key)
  const embeds = getEmbeds()
  if (!dashboard) {
    message = await channel.send({ embeds, components })
    addDashboardMessage({
      key,
      channelId: channel.id,
      messageId: message.id,
    })
  } else {
    message = await channel.messages.fetch(dashboard.messageId)
    await message.edit({ embeds, components })
  }
}

export const updateActiveMessage: PromiseFn<void, void> = async () => {
  if (!message) return
  const embeds = getEmbeds()
  await message.edit({ embeds, components })
}

const getEmbeds: Fn<void, MessageEmbed[]> = () => {
  const browser = new MessageEmbed()
  const app = new MessageEmbed()

  browser.setColor('#81c784')
  browser.setAuthor('Test Person')
  browser.setFooter('Some karma and time')

  app.setColor('#81c784')
  app.setAuthor('Test Person')
  app.setFooter('Some karma and time')

  return [browser, app]
}

const components = [
  new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('browser')
        .setLabel('💻 Takeover')
        .setStyle('SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId('phone')
        .setLabel('📱 Takeover')
        .setStyle('SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId('off')
        .setLabel('Go Offline')
        .setStyle('DANGER')
    ),
]
