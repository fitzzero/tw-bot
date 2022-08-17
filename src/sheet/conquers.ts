import { keys } from 'ts-transformer-keys'
import { conquerAlerts } from '../discord/alerts/conquerAlerts'
import { RowStructure, SheetData } from './sheetData'

export interface ConquerData extends RowStructure {
  id: string
  unix: string
  newPlayer: string
  oldPlayer: string
}

const headers = keys<ConquerData>().map(key => key.toString())

class Conquers extends SheetData<ConquerData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  auditAndUpdate = async (newData: ConquerData) => {
    const existingData = this.getById(newData.id)
    // If new
    if (!existingData) {
      await this.add(newData)
      await conquerAlerts(newData)
      return
    }
    // Update data
    await this.update(newData)
  }
}

export const conquers = new Conquers('conquers', headers)
