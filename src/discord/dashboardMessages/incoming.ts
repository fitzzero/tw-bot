import moment, { Moment } from 'moment'
import { WRChannels } from '../../sheet/channels'
import { IncomingData, incomings } from '../../sheet/incomings'
import { messages } from '../../sheet/messages'
import { villages } from '../../sheet/villages'
import { getUnix, validateMoment } from '../../utility/time'
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

  let description = ''

  for (const incoming of villageIncomings) {
    incoming.messageId = messageId
    const sent = moment(new Date(incoming.sent))
    const arrival = parseArrival(incoming.arrival, sent)
    if (!arrival) continue

    // Remove old incomings and skip
    if (arrival.isBefore()) {
      await incomings.update({ ...incoming, status: 'old' })
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

  const payload = villageMessage({
    color: WRColors.warning,
    description,
    extraContext: false,
    village: targetVillage,
  })

  await messages.rebuildMessage({
    id: messageId,
    channelId: WRChannels.incoming,
    payload,
  })
  return
}

const parseArrival = (dateGiven: string, sent: Moment) => {
  if (dateGiven.includes('today at')) {
    const sentToday = sent.format('MMMM Do YYYY')
    dateGiven = dateGiven.replace('today at', sentToday + ',')
  }
  if (dateGiven.includes('tomorrow at')) {
    const sentTomorrow = sent.add(1, 'days').format('MMMM Do YYYY')
    dateGiven = dateGiven.replace('tomorrow at', sentTomorrow + ',')
  }
  return validateMoment(dateGiven)
}
