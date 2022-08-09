import moment, { Moment } from 'moment'
import { WRChannels } from '../../sheet/channels'
import { IncomingData, incomings } from '../../sheet/incomings'
import { messages } from '../../sheet/messages'
import { villages } from '../../sheet/villages'
import { formatDate, getUnix, validateMoment } from '../../utility/time'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

export interface IncomingDashboardProps {
  coords: string
  villageIncomings: IncomingData[]
}
export const syncIncomingDashboard = async ({
  coords,
  villageIncomings,
}: IncomingDashboardProps) => {
  const targetVillage = villages.getByCoordString(coords)
  if (!targetVillage) return
  const messageId = `incoming-${coords}`

  let changes = false
  let newIncomings = false
  let description = ''

  for (const incoming of villageIncomings) {
    // Meta data
    let sent: Moment | undefined = undefined
    let arrival: Moment | undefined = undefined

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

    // Remove old incomings and skip
    if (arrival?.isBefore()) {
      await incomings.update({ ...incoming, status: 'old' })
      changes = true
      continue
    }

    // Add incoming target to message description
    description += `:arrow_right: Arrives <t:${getUnix(arrival)}:R>\n`

    // Add incoming origin to message description
    description += `:arrow_left: Sent <t:${getUnix(sent)}:R>\n\n`
  }

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
