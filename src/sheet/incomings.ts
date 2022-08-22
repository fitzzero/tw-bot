import { isEmpty, uniq } from 'lodash'
import moment, { Moment } from 'moment'
import { keys } from 'ts-transformer-keys'
import { isDev } from '../config'
import {
  IncomingMax,
  syncIncomingDashboard,
} from '../discord/dashboardMessages/incoming'
import { logger } from '../utility/logger'
import { formatDate, momentUtcOffset, validateMoment } from '../utility/time'
import { channels, WRChannels } from './channels'
import { RowStructure, SheetData } from './sheetData'

export interface IncomingData extends RowStructure {
  id: string
  sent: string
  target: string
  arrival: string
  origin: string
  player: string
  distance: string
  unit: string
  tags: string
  status: string
}

const headers = keys<IncomingData>().map(key => key.toString())

class Incomings extends SheetData<IncomingData> {
  totalIncomings = 0

  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getIncomingsByCoords = (coordString: string, idx?: string) => {
    let villageIncomings = this.filterByProperties([
      { prop: 'target', value: coordString },
      { prop: 'status', value: 'active' },
    ])?.sort((a, b) => {
      const aTime = validateMoment(a.arrival)?.unix()
      const bTime = validateMoment(b.arrival)?.unix()
      if (!aTime || !bTime) {
        return 0
      }
      return aTime - bTime
    })
    if (idx) {
      const start = parseInt(idx) * IncomingMax
      villageIncomings = villageIncomings?.slice(start, start + IncomingMax)
    }

    return villageIncomings
  }

  syncIncomings = async () => {
    await this.loadRows()
    let incomings = this.getAll()
    incomings = incomings?.filter(incoming => incoming.status != 'old')

    // Update Total Incomings
    if (this.totalIncomings != incomings?.length) {
      this.totalIncomings = incomings?.length || 0
      await channels.editChannel({
        id: WRChannels.incoming,
        name: `${WRChannels.incoming}-${incomings?.length || 0}`,
      })
    }

    if (!incomings || isEmpty(incomings)) return
    logger({
      message: `Checking ${incomings.length} incomings`,
      prefix: 'start',
    })

    const targets = []
    const targetNew = []
    const targetChanges = []
    for (const incoming of incomings) {
      // Validate and update dates if new
      if (incoming.status == 'new') {
        const sent = moment(new Date(incoming.sent)).utcOffset(momentUtcOffset)
        const arrival = parseArrival(incoming.arrival, sent)
        if (!arrival) continue

        incoming.sent = formatDate(sent)
        incoming.arrival = formatDate(arrival)
        incoming.status = 'active'

        await this.update(incoming)
        targetNew.push(incoming.target)
      }
      const arrival = validateMoment(incoming.arrival)
      // Set status to Old if arrival is past and skip
      if (arrival?.isBefore()) {
        await this.update({ ...incoming, status: 'old' })
        targetChanges.push(incoming.target)
      }
      targets.push(incoming.target)
    }

    const uniqueTargets = uniq(targets)
    let totalChanges = false

    for (const target of uniqueTargets) {
      // Changes if any new or active->old
      const changes =
        targetChanges.includes(target) || targetNew.includes(target)
      if (changes) totalChanges = true
      // Sync if changes
      if (changes || isDev) {
        await syncIncomingDashboard({
          coords: target,
          newIncomings: targetNew.includes(target),
        })
      }
    }

    logger({
      message: `Synced incomings - changes: ${totalChanges}`,
      prefix: 'success',
    })
  }
}

export const incomings = new Incomings('incomings', headers)

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
