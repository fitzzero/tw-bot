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
import { getDiscordEmoji } from '../guild'
import { villageMessage } from '../messages/village'

export const IncomingMax = isDev ? 10 : 10

interface MessageAttacks {
  arrival: Moment
  target: string
  origin: string
}

export interface IncomingDashboardProps {
  coords: string
  changes?: boolean
  newIncomings?: boolean
}

export const syncIncomingDashboard = async ({
  coords,
  changes = false,
  newIncomings = false,
}: IncomingDashboardProps) => {
  // Get incomings to display
  const villageIncomings = incomings.getIncomingsByCoords(coords)
  if (!villageIncomings) return
  // Metadata
  const targetVillage = villages.getByCoordString(coords)
  if (!targetVillage) return
  const messageId = `incoming-${coords}`

  const messageAttacks: MessageAttacks[] | undefined = []

  // Does the message need to be edited because of data changes?
  if (isDev) changes = true
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

    // Remove old incomings and skip
    if (arrival.isBefore()) {
      await incomings.update({ ...incoming, status: 'old' })
      changes = true
      continue
    }

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
      originMessage = `:arrow_left: ${emoji} Sent by ${
        player?.name + ' ' + originVillage.name
      } <t:${getUnix(sent)}:R>`
    } else {
      originMessage = `:arrow_left: Sent <t:${getUnix(sent)}:R>`
    }

    // Add incoming target to message description
    messageAttacks.push({
      arrival,
      target: `:arrow_right: Lands ${arrival.format(
        momentStringFormat
      )} <t:${getUnix(arrival)}:R>`,
      origin: originMessage,
    })
  }

  // Build message description
  let description = ''
  messageAttacks.slice(0, IncomingMax).forEach(attack => {
    description += `${attack.target}\n${attack.origin}\n\n`
  })

  // If no incomings, remove dashboard
  if (description == '') {
    await messages.deleteMessage(messageId)
    return
  }

  // If no changes, do nothing
  if (!changes) return

  const payload = villageMessage({
    color: WRColors.warning,
    description,
    extraContext: false,
    village: targetVillage,
  })

  payload.components = [
    {
      type: 1,
      components: [
        {
          style: 1,
          label: `Update Origin`,
          custom_id: `incoming-origin`,
          type: 2,
        },
        // {
        //   style: 2,
        //   label: `Set Reminder`,
        //   custom_id: `incoming-reminder`,
        //   disabled: false,
        //   type: 2,
        // },
      ],
    },
  ]

  const handleFn = newIncomings ? messages.rebuildMessage : messages.syncMessage

  await handleFn({
    id: messageId,
    channelId: WRChannels.incoming,
    payload,
  })
  return
}
