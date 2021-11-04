import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Snowflake,
} from 'discord.js'
import {
  addDashboardMessage,
  getActiveWorld,
  updateDashboardMessage,
} from '../db/world/worldController'
import { PromiseFn } from '../types/methods'
import { currentUnix } from '../utility/time'
import { wait } from '../utility/wait'
import { discordAlert } from './alert'
import { getDashboardChannel } from './dashboard'
import { getActiveGuild } from './guild'

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
  const content = `Last updated <t:${currentUnix()}:R>`
  if (!dashboard) {
    message = await channel.send({ content, embeds, components })
    addDashboardMessage({
      key,
      channelId: channel.id,
      messageId: message.id,
    })
  } else {
    try {
      message = await channel.messages.fetch(dashboard.messageId as Snowflake)
    } catch (err) {
      message = await channel.send({ content, embeds, components })
      updateDashboardMessage({
        key,
        channelId: channel.id,
        messageId: message.id,
      })
    }
    await message.edit({ content, embeds, components })
  }
}

export const updateActiveMessage: PromiseFn<void, void> = async () => {
  if (!message) return
  const embeds = await getEmbeds()
  const content = `Last updated <t:${currentUnix()}:R>`
  await message.edit({ content, embeds, components })
}

const getEmbeds: PromiseFn<void, MessageEmbed[]> = async () => {
  const browser = new MessageEmbed()
  const app = new MessageEmbed()

  await wait(5000)
  const guild = await getActiveGuild()
  const world = getActiveWorld()
  if (!guild || !world || !world.roles) return [browser, app]

  const phoneRole = await guild.roles.fetch(world.roles.app)
  const browserRole = await guild.roles.fetch(world.roles.browser)

  const browserUser = browserRole?.members?.random()
  const browserAvatar = browserUser?.displayAvatarURL()
  const phoneUser = phoneRole?.members?.random()
  const phoneAvatar = phoneUser?.displayAvatarURL()

  if (browserUser) {
    browser.setColor('#81c784')
    browser.setAuthor(
      browserUser.displayName,
      browserAvatar ? browserAvatar : undefined
    )
    //browser.setFooter('Some karma and time')
  } else {
    browser.setColor('#e3f2fd')
    browser.setAuthor('Open')
  }

  if (phoneUser) {
    app.setColor('#81c784')
    app.setAuthor(phoneUser.displayName, phoneAvatar ? phoneAvatar : undefined)
    //browser.setFooter('Some karma and time')
  } else {
    app.setColor('#e3f2fd')
    app.setAuthor('Open')
  }

  return [browser, app]
}

const components = [
  new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.BROWSER)
        .setLabel('💻 Takeover')
        .setStyle('SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.PHONE)
        .setLabel('📱 Takeover')
        .setStyle('SUCCESS')
    )
    .addComponents(
      new MessageButton()
        .setCustomId(ButtonInteractions.OFF)
        .setLabel('Go Offline')
        .setStyle('DANGER')
    ),
]

export const handleActiveInteraction: PromiseFn<ButtonInteraction, void> =
  async interaction => {
    const guild = await getActiveGuild()
    const world = getActiveWorld()
    if (!guild || !world || !world.roles?.app) return

    const member = await guild.members.fetch(interaction.user.id)
    const phoneRole = await guild.roles.fetch(world.roles.app)
    const browserRole = await guild.roles.fetch(world.roles.browser)
    if (!phoneRole || !browserRole) return

    if (interaction.customId === ButtonInteractions.PHONE) {
      phoneRole.members.map(m => {
        m.roles.remove(phoneRole)
      })
      await member.roles.add(phoneRole)
      discordAlert({ message: `${member.displayName} now on Phone` })
    }
    if (interaction.customId === ButtonInteractions.BROWSER) {
      browserRole.members.map(m => {
        m.roles.remove(browserRole)
      })
      await member.roles.add(browserRole)
      discordAlert({ message: `${member.displayName} now on Browser` })
    }
    if (interaction.customId === ButtonInteractions.OFF) {
      await member.roles.remove(browserRole)
      await member.roles.remove(phoneRole)
      discordAlert({ message: `${member.displayName} is off` })
    }
    interaction.update('Updating...')
    updateActiveMessage()
    return
  }
