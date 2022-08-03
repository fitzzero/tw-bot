import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface SettingsData extends RowStructure {
  id: string
  value: string
}

const headers = keys<SettingsData>().map(key => key.toString())

export const enum WarRoomSettings {
  world = 'world',
  startCoords = 'startCoordinates',
  playerR = 'playerRadius',
  barbR = 'barbRadius',
  browserId = 'browserRoleId',
  mobileId = 'mobileRoleId',
  map = 'map',
}

class Settings extends SheetData<SettingsData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getSettingValue = (id: string) => {
    return this.getById(id)?.value
  }

  getAlertSettings = () => {
    const coordinates = this.getSettingValue(WarRoomSettings.startCoords)
    const playerRadius = this.getSettingValue(WarRoomSettings.playerR)
    const barbRadius = this.getSettingValue(WarRoomSettings.barbR)
    if (!coordinates || !playerRadius || !barbRadius) return
    const coordsSplit = coordinates.split('|')
    if (!coordsSplit?.[0]) return
    return {
      x: parseInt(coordsSplit[0]),
      y: parseInt(coordsSplit[1]),
      playerRadius: parseInt(playerRadius),
      barbRadius: parseInt(barbRadius),
    }
  }
}

export const settings = new Settings('settings', headers)
