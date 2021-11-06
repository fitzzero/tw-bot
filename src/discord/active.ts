import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Snowflake,
} from 'discord.js'
import moment, { Moment } from 'moment'
import {
  addDashboardMessage,
  getActiveWorld,
  updateDashboardMessage,
} from '../db/world/worldController'
import { Fn, PromiseFn } from '../@types/methods'
import { DashboardMessage } from '../@types/world'
import { getUnix } from '../utility/time'
import { discordAlert } from './alert'
import { getDashboardChannel } from './dashboard'
import { getActiveGuild } from './guild'

interface MessageData extends DashboardMessage {
  data: {
    phoneId?: string
    phoneChanged?: Moment
    browserId?: string
    browserChanged?: Moment
  }
}
let activeMessageData: MessageData | undefined = undefined
let message: Message | undefined = undefined

enum ButtonInteractions {
  PHONE = 'active-phone',
  BROWSER = 'active-browser',
  OFF = 'active-off',
}

export const activeButtonIds: string[] = [
  ButtonInteractions.PHONE,
  ButtonInteractions.BROWSER,
  ButtonInteractions.OFF,
]

export const loadActiveMessage: PromiseFn<void, void> = async () => {
  const key = 'active'
  const world = getActiveWorld()
  if (!world?.roles?.app) return

  const channel = await getDashboardChannel()
  if (!channel) return

  const dashboard = world?.dashboard?.find(message => message.key === key)
  const embeds = await getEmbeds()
  const components = getComponents()
  if (!dashboard) {
    message = await channel.send({ embeds, components })
    activeMessageData = await addDashboardMessage({
      key,
      channelId: channel.id,
      messageId: message.id,
      data: {},
    })
  } else {
    activeMessageData = dashboard
    if (!activeMessageData.data) activeMessageData.data = {}
    try {
      message = await channel.messages.fetch(dashboard.messageId as Snowflake)
    } catch (err) {
      message = await channel.send({ embeds, components })
      await updateDashboardMessage({
        ...activeMessageData,
        messageId: message.id,
      })
    }
    await message.edit({ embeds, components })
  }
}

export const updateActiveMessage: PromiseFn<void, void> = async () => {
  if (!message || !activeMessageData) return
  const embeds = await getEmbeds()
  const components = getComponents()
  await message.edit({ embeds, components })
  updateDashboardMessage(activeMessageData)
}

const getEmbeds: PromiseFn<void, MessageEmbed[]> = async () => {
  const browser = new MessageEmbed()
  browser.setColor('#e3f2fd')
  browser.setAuthor('💻 Open')
  const app = new MessageEmbed()
  app.setColor('#e3f2fd')
  app.setAuthor('📱 Open')

  const guild = await getActiveGuild()
  const world = getActiveWorld()
  if (!guild || !world || !world.roles || !activeMessageData)
    return [browser, app]

  const browserUserId = activeMessageData.data.browserId
  const phoneUserId = activeMessageData.data.phoneId

  if (browserUserId) {
    const member = await guild.members.fetch(browserUserId)
    const avatar = member.user.displayAvatarURL()
    const sinceUnix = getUnix(activeMessageData.data.browserChanged)
    browser.setColor('#81c784')
    browser.setAuthor(member.displayName, avatar ? avatar : undefined)
    browser.setDescription(`💻 since <t:${sinceUnix}:R>`)
  }

  if (phoneUserId) {
    const member = await guild.members.fetch(phoneUserId)
    const avatar = member.user.displayAvatarURL()
    const sinceUnix = getUnix(activeMessageData.data.phoneChanged)
    app.setColor('#81c784')
    app.setAuthor(member.displayName, avatar ? avatar : undefined)
    app.setDescription(`📱 since <t:${sinceUnix}:R>`)
  }

  return [browser, app]
}

const getComponents: Fn<void, MessageActionRow[]> = () => {
  const activePhone = activeMessageData?.data.phoneId
  const activeBrowser = activeMessageData?.data.browserId
  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.BROWSER)
        .setLabel('💻 Takeover')
        .setStyle(activeBrowser ? 'SECONDARY' : 'SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.PHONE)
        .setLabel('📱 Takeover')
        .setStyle(activePhone ? 'SECONDARY' : 'SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.OFF)
        .setLabel('Go Offline')
        .setStyle('DANGER')
    )
  return [row]
}

export const handleActiveInteraction: PromiseFn<ButtonInteraction, void> =
  async interaction => {
    const guild = await getActiveGuild()
    const world = getActiveWorld()
    if (!guild || !world || !world.roles?.app || !activeMessageData) return

    const member = await guild.members.fetch(interaction.user.id)
    const phoneRole = await guild.roles.fetch(world.roles.app)
    const browserRole = await guild.roles.fetch(world.roles.browser)
    const channel = await getDashboardChannel()
    if (!phoneRole || !browserRole) return

    interaction.deferUpdate()
    // Phone Button
    if (interaction.customId === ButtonInteractions.PHONE) {
      phoneRole.members.map(m => {
        m.roles.remove(phoneRole)
      })
      await member.roles.add(phoneRole)
      activeMessageData.data.phoneId = member.id
      activeMessageData.data.phoneChanged = moment()
      discordAlert({
        message: `<t:${getUnix()}:R>: ${member.displayName} is on 📱 (<#${
          channel?.id
        }>)`,
      })
    }
    // Browser Button
    if (interaction.customId === ButtonInteractions.BROWSER) {
      browserRole.members.map(m => {
        m.roles.remove(browserRole)
      })
      await member.roles.add(browserRole)
      activeMessageData.data.browserId = member.id
      activeMessageData.data.phoneChanged = moment()
      discordAlert({
        message: `<t:${getUnix()}:R>: ${member.displayName} is on 💻 (<#${
          channel?.id
        }>)`,
      })
    }
    // Offline Button
    if (interaction.customId === ButtonInteractions.OFF) {
      if (member.id === activeMessageData.data.browserId) {
        activeMessageData.data.browserId = undefined
        activeMessageData.data.browserChanged = moment()
      }
      if (member.id === activeMessageData.data.phoneId) {
        activeMessageData.data.phoneId = undefined
        activeMessageData.data.phoneChanged = moment()
      }
      await member.roles.remove(browserRole)
      await member.roles.remove(phoneRole)
      discordAlert({
        message: `<t:${getUnix()}:R>: ${member.displayName} is now offline (<#${
          channel?.id
        }>)`,
      })
    }
    updateActiveMessage()
    return
  }
