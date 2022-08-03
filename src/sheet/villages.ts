import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface VillageData extends RowStructure {
  id: string
  name: string
  x: string
  y: string
  k: string
  playerId: string
  points: string
  rank: string
}

const headers = keys<VillageData>().map(key => key.toString())

class Villages extends SheetData<VillageData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  auditAndUpdate = async (newData: VillageData) => {
    const existingData = this.getById(newData.id)
    if (!existingData) {
      await this.add(newData)
      return
    }

    // Point drop
  }
}

export const villages = new Villages('villages', headers)
