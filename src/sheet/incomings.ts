import { isEmpty, uniq } from 'lodash'
import moment, { Moment } from 'moment'
import { keys } from 'ts-transformer-keys'
import {
  IncomingMax,
  syncIncomingDashboard,
} from '../discord/dashboardMessages/incoming'
import { logger } from '../utility/logger'
import { formatDate, validateMoment } from '../utility/time'
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
    if (!incomings || isEmpty(incomings)) return
    logger({
      message: `Checking ${incomings.length} incomings`,
      prefix: 'start',
    })

    const targets = []
    const newTargets = []
    // Validate new incomings
    for (const incoming of incomings) {
      // Validate and update dates if new
      if (incoming.status == 'new') {
        const sent = moment(new Date(incoming.sent))
        const arrival = parseArrival(incoming.arrival, sent)
        if (!arrival) continue

        incoming.sent = formatDate(sent)
        incoming.arrival = formatDate(arrival)
        incoming.status = 'active'

        await this.update(incoming)
        newTargets.push(incoming.target)
      }
      const arrival = validateMoment(incoming.arrival)
      // Set status to Old if arrival is past and skip
      if (arrival?.isBefore()) {
        await this.update({ ...incoming, status: 'old' })
        continue
      }
      targets.push(incoming.target)
    }

    const uniqueTargets = uniq(targets)

    for (const target of uniqueTargets) {
      await syncIncomingDashboard({
        coords: target,
        newIncomings: newTargets.includes(target),
        changes: newTargets.includes(target),
      })
    }
    logger({
      message: `Synced incomings`,
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
