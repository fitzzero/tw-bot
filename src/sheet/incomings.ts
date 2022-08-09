import { chain, isEmpty } from 'lodash'
import { keys } from 'ts-transformer-keys'
import { syncIncomingDashboard } from '../discord/dashboardMessages/incoming'
import { logger } from '../utility/logger'
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

  syncIncomings = async () => {
    await this.loadRows()
    let incomings = this.getAll()
    incomings = incomings?.filter(incoming => incoming.status != 'old')

    if (!incomings || isEmpty(incomings)) return
    logger({
      message: `Checking ${incomings.length} incomings`,
      prefix: 'start',
    })

    const groupedIncomings = chain(incomings)
      .groupBy('target')
      .map((value, key) => ({ target: key, incomings: value }))
      .value()

    for (const village of groupedIncomings) {
      await syncIncomingDashboard({
        coords: village.target,
        villageIncomings: village.incomings,
      })
    }
    logger({
      message: `Synced incomings`,
      prefix: 'success',
    })
  }
}

export const incomings = new Incomings('incomings', headers)
