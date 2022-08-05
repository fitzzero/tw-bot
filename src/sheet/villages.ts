import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, RowStructure, SheetData } from './sheetData'
import { settings } from './settings'
import { villageMessage } from '../discord/messages/village'
import { channels, WarRoomChannels } from './channels'
import { colors } from '../discord/colors'
import { getHoursSince } from '../utility/time'

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

  auditAndUpdate = async (newData: VillageData) => {
    const existingData = this.getById(newData.id)
    if (!existingData || newData.id != existingData.id) {
      await this.add(newData)
      return
    }
    // Update data
    await this.update(newData)

    if (inAlertRange(newData)) {
      await this.villageChangeAlerts(newData, existingData)
    }
  }

  villageChangeAlerts = async (
    newData: VillageData,
    oldData: VillageData & BaseSheetModel
  ) => {
    let content: string | undefined = undefined
    let color: colors | undefined = undefined
    // Point alerts
    const pointDif = parseInt(newData.points) - parseInt(oldData.points)
    if (parseInt(newData.points) > 2000 && pointDif > 510) {
      content = `Has increased **${pointDif}** points, could be Academy`
    }
    if (pointDif < 0) {
      content = `Has dropped **${pointDif}** points`
      color = colors.error
    }

    const hoursSince = getHoursSince(oldData.lastUpdate)
    if (
      newData.playerId != '0' &&
      !this.hasChanges(newData) &&
      hoursSince &&
      hoursSince == 48
    ) {
      content = `Inactive for 48 hours`
      color = colors.error
    }

    if (content) {
      const message = villageMessage(newData, content, color)
      await channels.sendMessage(WarRoomChannels.news, message)
    }
    return
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

export const splitCoords = (coords: string) => {
  const coordsSplit = coords.split('|')
  if (!coordsSplit?.[1]) return
  return {
    x: coordsSplit[0],
    y: coordsSplit[1],
  }
}
