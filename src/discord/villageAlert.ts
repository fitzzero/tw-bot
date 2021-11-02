import { ColorResolvable, MessageEmbed, TextChannel } from 'discord.js'
import { discordConfig } from '../config'
import { getActivePlayerData } from '../tw/player'
import { PromiseFn } from '../types/methods'
import { Village } from '../types/village'
import { logger } from '../utility/logger'
import { getActiveGuild } from './guild'

let channel: TextChannel | undefined = undefined

export interface VillageAlertProps {
  color: 'red' | 'yellow' | 'blue' | 'green' | 'white' | 'purple'
  message: string
  village: Village
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
  const colorHex = colorKey[color] as ColorResolvable
  const embed = new MessageEmbed()
    .setColor(colorHex)
    .setTitle(`${village.name} (${village._id})`)
    .setURL(
      `https://us56.tribalwars.us/game.php?screen=info_village&id=${village.number}`
    )
    .addField('Points', `${village.points}`)

  if (player) {
    embed.addField('Player', player.name, true)
    embed.addField('Tribe', player.tribe, true)
  }

  if (fields) {
    fields.forEach(field => {
      embed.addField(field.name, field.value, field.inline)
    })
  }

  embed.addField('Last Update', message)

  channel?.send({ embeds: [embed] })
}
