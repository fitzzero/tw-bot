import { chain } from 'lodash'
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
    const incomings = this.getAll()
    const checkIncomings = incomings?.filter(
      incoming => incoming.status != 'old'
    )

    if (!checkIncomings) return
    logger({
      message: `Checking ${checkIncomings.length} incomings`,
      prefix: 'start',
    })
    const groupedIncomings = chain(checkIncomings)
      .groupBy('target')
      .map((value, key) => ({ target: key, incomings: value }))
      .value()

    for (const incoming of groupedIncomings) {
      await syncIncomingDashboard({
        coords: incoming.target,
        villageIncomings: incoming.incomings,
      })
    }
    logger({
      message: `Synced incomings`,
      prefix: 'success',
    })
  }

  //syncIncomingDashboard = async (id: string) => {}
}

export const incomings = new Incomings('incomings', headers)
