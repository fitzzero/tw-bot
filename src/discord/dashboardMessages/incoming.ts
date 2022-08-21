import { APIButtonComponentWithCustomId } from 'discord.js'
import { Moment } from 'moment'
import { isDev } from '../../config'
import { WRChannels } from '../../sheet/channels'
import { incomings } from '../../sheet/incomings'
import { messages } from '../../sheet/messages'
import { players } from '../../sheet/players'
import { UnitData } from '../../sheet/units'
import { VillageData, villages } from '../../sheet/villages'
import { getUnitByDistance } from '../../tw/village'
import { getUnix, momentStringFormat, validateMoment } from '../../utility/time'
import { WRColors } from '../colors'
import { getDiscordComponentEmoji, getDiscordEmoji, WREmojis } from '../guild'
import { villageMessage } from '../messages/village'

export const IncomingMax = isDev ? 5 : 5

interface MessageAttacks {
  arrival: Moment
  target: string
  origin: string
}

export interface IncomingDashboardProps {
  coords: string
  newIncomings?: boolean
  idx?: string
}

export const syncIncomingDashboard = async ({
  coords,
  newIncomings = false,
  idx = '0',
}: IncomingDashboardProps) => {
  // Get incomings to display
  const messageId = `incoming-${coords}`
  const villageIncomings = incomings.getIncomingsByCoords(coords, idx)
  // If no incomings, remove dashboard
  if (!villageIncomings) {
    await messages.deleteMessage(messageId)
    return
  }
  // Metadata
  const targetVillage = villages.getByCoordString(coords)
  if (!targetVillage) return
  const totalIncomings =
    incomings.filterByProperties([
      { prop: 'target', value: coords },
      { prop: 'status', value: 'active' },
    ])?.length || 0
  const percent = Math.round((totalIncomings / incomings.totalIncomings) * 100)
  const page = parseInt(idx) + 1
  const totalPages = Math.ceil(totalIncomings / IncomingMax)

  const arrows = {
    left: await getDiscordComponentEmoji(WREmojis.left),
    leftFrom: await getDiscordEmoji(WREmojis.leftFrom),
    right: await getDiscordComponentEmoji(WREmojis.right),
    rightFrom: await getDiscordEmoji(WREmojis.rightFrom),
  }

  const messageAttacks: MessageAttacks[] | undefined = []

  // Does the message need to be rebuild because of new incomings?

  for (const incoming of villageIncomings) {
    // Meta data
    let sent: Moment | undefined = undefined
    let arrival: Moment | undefined = undefined
    let originVillage: VillageData | undefined = undefined
    let unit: UnitData | undefined = undefined

    sent = validateMoment(incoming.sent)
    arrival = validateMoment(incoming.arrival)

    if (!arrival || !sent) continue

    let originMessage = ''

    if (incoming.origin)
      originVillage = villages.getByCoordString(incoming.origin)
    if (originVillage) {
      unit = getUnitByDistance({
        target: targetVillage,
        targetLand: arrival,
        origin: originVillage,
        originSend: sent,
      })
    }
    if (unit && originVillage) {
      const emoji = await getDiscordEmoji(unit.id)
      const player = players.getById(originVillage?.playerId)
      originMessage = `${arrows.leftFrom} ${emoji} Sent by ${
        player?.name + ' ' + originVillage.name
      } <t:${getUnix(sent)}:R>`
    } else {
      originMessage = `${arrows.leftFrom} Sent <t:${getUnix(sent)}:R>`
    }

    // Add incoming target to message description
    messageAttacks.push({
      arrival,
      target: `${arrows.rightFrom} Lands ${arrival.format(
        momentStringFormat
      )} <t:${getUnix(arrival)}:R>`,
      origin: originMessage,
    })
  }

  // Build message description
  let description = ''
  messageAttacks.forEach(attack => {
    description += `${attack.target}\n${attack.origin}\n\n`
  })

  description += `Page **${page}** of **${totalPages}** (${totalIncomings} total - **${percent}**%)`

  const payload = villageMessage({
    color: WRColors.warning,
    description,
    extraContext: false,
    village: targetVillage,
  })

  const components: APIButtonComponentWithCustomId[] = [
    {
      style: 1,
      label: `Update Origin`,
      custom_id: `incoming-origin`,
      type: 2,
    },
  ]
  if (page > 1) {
    components.push({
      style: 2,
      label: `Page ${page - 1}`,
      emoji: arrows.left,
      custom_id: `incoming-idx-decrease`,
      type: 2,
    })
  }
  if (page < totalPages) {
    components.push({
      style: 2,
      label: `Page ${page + 1}`,
      emoji: arrows.right,
      custom_id: `incoming-idx-increase`,
      type: 2,
    })
  }

  payload.components = [
    {
      type: 1,
      components,
    },
  ]

  const handleFn = newIncomings ? messages.rebuildMessage : messages.syncMessage

  await handleFn({
    id: messageId,
    channelId: WRChannels.incoming,
    payload,
    options: idx,
  })
  return
}
