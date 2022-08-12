import moment, { Moment } from 'moment'
import { isDev } from '../../config'
import { WRChannels } from '../../sheet/channels'
import { IncomingData, incomings } from '../../sheet/incomings'
import { messages } from '../../sheet/messages'
import { players } from '../../sheet/players'
import { UnitData, units } from '../../sheet/units'
import { VillageData, villages } from '../../sheet/villages'
import { getUnitByDistance } from '../../tw/village'
import { formatDate, getUnix, validateMoment } from '../../utility/time'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

interface MessageAttacks {
  arrival: Moment
  target: string
  origin: string
}

export interface IncomingDashboardProps {
  coords: string
  villageIncomings: IncomingData[]
  changes?: boolean
}

export const syncIncomingDashboard = async ({
  coords,
  villageIncomings,
  changes = false,
}: IncomingDashboardProps) => {
  const targetVillage = villages.getByCoordString(coords)
  if (!targetVillage) return
  const messageId = `incoming-${coords}`

  const messageAttacks: MessageAttacks[] | undefined = []

  // Does the message need to be edited because of data changes?
  if (isDev) changes = true
  // Does the message need to be rebuild because of new incomings?
  let newIncomings = false

  for (const incoming of villageIncomings) {
    // Meta data
    let sent: Moment | undefined = undefined
    let arrival: Moment | undefined = undefined
    let originVillage: VillageData | undefined = undefined
    let unit: UnitData | undefined = undefined

    if (incoming.status == 'new') {
      sent = moment(new Date(incoming.sent))
      arrival = parseArrival(incoming.arrival, sent)
      if (!arrival) continue

      incoming.sent = formatDate(sent)
      incoming.arrival = formatDate(arrival)
      incoming.status = 'active'

      await incomings.update(incoming)
      newIncomings = true
      changes = true
    } else {
      sent = validateMoment(incoming.sent)
      arrival = validateMoment(incoming.arrival)
    }

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
      const emoji = await units.getDiscordEmoji(unit.id)
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
        'HH:mm:ss:SS'
      )} <t:${getUnix(arrival)}:R>`,
      origin: originMessage,
    })
  }

  // Build message description
  let description = ''
  messageAttacks
    .sort((a, b) => a.arrival.unix() - b.arrival.unix())
    .slice(0, 10)
    .forEach(attack => {
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

const parseArrival = (dateGiven: string, sent: Moment) => {
  const reference = moment(sent)
  if (dateGiven.includes('today at')) {
    const sentToday = reference.format('MMMM Do YYYY')
    dateGiven = dateGiven.replace('today at', sentToday + ',')
  }
  if (dateGiven.includes('tomorrow at')) {
    const sentTomorrow = reference.add(1, 'days').format('MMMM Do YYYY')
    dateGiven = dateGiven.replace('tomorrow at', sentTomorrow + ',')
  }
  return validateMoment(dateGiven)
}
