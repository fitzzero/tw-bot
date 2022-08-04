import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'
import { settings } from './settings'
import { villageMessage } from '../discord/messages/village'
import { channels, WarRoomChannels } from './channels'

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
    this.update(newData)

    if (inAlertRange(newData)) await villageChangeAlerts(newData, existingData)
  }
}

export const villages = new Villages('villages', headers)

const inAlertRange = (village: VillageData) => {
  const alertSettings = settings.getAlertSettings()
  if (!alertSettings) return false
  const xDistance = alertSettings.x - parseInt(village.x)
  const yDistance = alertSettings.y - parseInt(village.y)
  const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  if (village.playerId == '0' && distance < alertSettings.barbRadius) {
    // console.log(
    //   `${village.name} (${village.x}|${village.y}) is ${distance} away`
    // )
    return true
  }
  if (distance < alertSettings.playerRadius) {
    // console.log(
    //   `${village.name} (${village.x}|${village.y}) is ${distance} away`
    // )
    return true
  }
  return false
}

const villageChangeAlerts = async (
  newData: VillageData,
  oldData: VillageData
) => {
  // Point alerts
  const pointDif = parseInt(newData.points) - parseInt(oldData.points)
  if (parseInt(newData.points) > 2000 && pointDif > 510) {
    const content = `Has increased ${pointDif}, could be Academy`
    const message = villageMessage(newData, content)
    await channels.sendMessage(WarRoomChannels.news, message)
  }
}
