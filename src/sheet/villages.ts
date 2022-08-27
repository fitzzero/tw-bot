import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'
import { inAlertRange, splitCoords } from '../tw/village'
import { villageChangeAlerts } from '../discord/alerts/villageAlerts'
import { players } from './players'
import { isEmpty } from 'lodash'

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

export interface Coordinates {
  x: string
  y: string
}

const headers = keys<VillageData>().map(key => key.toString())

class Villages extends SheetData<VillageData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getByCoords = ({ x, y }: Coordinates) => {
    const found = this.filterByProperties([
      { prop: 'x', value: x },
      { prop: 'y', value: y },
    ])
    return found?.[0]
  }

  getByCoordString = (coordString: string) => {
    const coords = splitCoords(coordString)
    if (!coords) return
    return this.getByCoords(coords)
  }

  getByTribeId = (id: string) => {
    const villageList: VillageData[] = []
    const playerData = players.filterByProperties([
      { prop: 'tribe', value: id },
    ])
    playerData?.forEach(player => {
      const newVillages = this.filterByProperties([
        { prop: 'playerId', value: player.id },
      ])
      if (newVillages) villageList.concat(newVillages)
    })
    if (isEmpty(villageList)) return
    return villageList
  }

  auditAndUpdate = async (newData: VillageData) => {
    const existingData = this.getById(newData.id)
    if (!existingData) {
      await this.add(newData)
      return
    }
    // Update data
    await this.update(newData)

    if (inAlertRange(newData)) {
      await villageChangeAlerts(newData, existingData)
    }
  }
}

export const villages = new Villages('villages', headers)
