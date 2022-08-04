import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'
import { settings, WarRoomSettings } from './settings'

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
    // Update data
    this.update({ ...newData })

    // If player village within radius

    // If barb village within radius
  }
}

export const villages = new Villages('villages', headers)

const villageDistance = (village: VillageData) => {
  const startCoordinates = settings.getValue(WarRoomSettings.startCoords)
}
