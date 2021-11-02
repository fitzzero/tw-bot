import { ColorResolvable, MessageEmbed, TextChannel } from 'discord.js'
import { discordConfig } from '../config'
import { getStartDistance } from '../db/village/villageStats'
import { getActivePlayerData } from '../tw/player'
import { getActiveTribeData } from '../tw/tribe'
import { PromiseFn } from '../types/methods'
import { VillageData } from '../types/village'
import { logger } from '../utility/logger'
import { currentUnix } from '../utility/time'
import { getActiveGuild } from './guild'

let channel: TextChannel | undefined = undefined

export interface VillageAlertProps {
  color: 'red' | 'yellow' | 'blue' | 'green' | 'white' | 'purple'
  message: string
  village: VillageData
  fields?: Field[]
}

interface Field {
  name: string
  value: string
  inline?: boolean
}

const colorKey = {
  red: '#e57373',
  yellow: '#ffb74d',
  blue: '#4fc3f7',
  green: '#81c784',
  white: '#e3f2fd',
  purple: '#ce93d8',
}

const getChannel = async (): Promise<void> => {
  try {
    const guild = await getActiveGuild()
    const channelId = discordConfig().guild.villages
    const someChannel = await guild?.channels.fetch(channelId)
    if (someChannel?.isText) {
      channel = someChannel as TextChannel
    }
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `Discord: ${err}` })
  }
}

export const villageAlert: PromiseFn<VillageAlertProps, void> = async ({
  message,
  village,
  color,
  fields,
}) => {
  if (!channel) {
    await getChannel()
  }
  if (!channel) {
    logger({ prefix: 'alert', message: `Discord: Couldn't load alert channel` })
    return
  }
  const player = getActivePlayerData().find(
    player => player._id === village.playerId
  )
  const tribe = getActiveTribeData().find(tribe => tribe._id === player?.tribe)
  const distance = getStartDistance({ x: village.x, y: village.y })

  const colorHex = colorKey[color] as ColorResolvable
  const embed = new MessageEmbed()
    .setColor(colorHex)
    .setTitle(`${village.name} (${village._id})`)
    .setURL(
      `https://us56.tribalwars.us/game.php?screen=info_village&id=${village.number}`
    )
    .addField('Points', `${village.points}`, true)

  if (distance) {
    embed.addField('Distance', distance, true)
  }

  if (player) {
    let playerString = player.name
    if (tribe) playerString += ` (${tribe?.tag})`
    embed.addField('Player / Tribe', playerString, true)
  }

  if (fields) {
    fields.forEach(field => {
      embed.addField(field.name, field.value, field.inline)
    })
  }

  const unixTime = currentUnix()

  embed.addField('Last Update', `${message} (<t:${unixTime}:R>)`)

  channel?.send({ embeds: [embed] })
}
