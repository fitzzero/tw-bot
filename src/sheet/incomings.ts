import { isEmpty, uniq } from 'lodash'
import { keys } from 'ts-transformer-keys'
import { syncIncomingDashboard } from '../discord/dashboardMessages/incoming'
import { logger } from '../utility/logger'
import { validateMoment } from '../utility/time'
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

  getIncomingsByCoords = (coordString: string) => {
    const villageIncomings = this.filterByProperties([
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

    const uniqueTargets = uniq(incomings.map(incoming => incoming.target))

    for (const target of uniqueTargets) {
      await syncIncomingDashboard({
        coords: target,
      })
    }
    logger({
      message: `Synced incomings`,
      prefix: 'success',
    })
  }
}

export const incomings = new Incomings('incomings', headers)
