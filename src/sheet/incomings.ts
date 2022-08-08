import { keys } from 'ts-transformer-keys'
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
  messageId: string
}

const headers = keys<IncomingData>().map(key => key.toString())

class Incomings extends SheetData<IncomingData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  syncIncomings = async () => {
    const newIncomings = this.filterByProperties([
      { prop: 'messageId', value: 'notAssigned' },
    ])
    if (!newIncomings) return
    logger({
      message: `Loading ${newIncomings.length} new incomings`,
      prefix: 'start',
    })
  }

  //syncIncomingDashboard = async (id: string) => {}
}

export const incomings = new Incomings('incomings', headers)
