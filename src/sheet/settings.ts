import { keys } from 'ts-transformer-keys'
import { splitCoords } from '../tw/village'
import { RowStructure, SheetData } from './sheetData'

export interface SettingsData extends RowStructure {
  id: string
  value: string
}

const headers = keys<SettingsData>().map(key => key.toString())

export const enum WRSettings {
  account = 'account',
  barbR = 'barbRadius',
  browserId = 'browserRoleId',
  map = 'map',
  mapconfig = 'mapconfig',
  mobileId = 'mobileRoleId',
  odAlerts = 'odAlerts',
  playerR = 'playerRadius',
  startCoords = 'startCoordinates',
  world = 'world',
}

class Settings extends SheetData<SettingsData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getValue = (id: string) => {
    return this.getById(id)?.value
  }

  getAlertSettings = () => {
    const coordinates = this.getValue(WRSettings.startCoords)
    if (!coordinates) return
    const coordsSplit = splitCoords(coordinates)
    const playerRadius = this.getValue(WRSettings.playerR)
    const barbRadius = this.getValue(WRSettings.barbR)
    if (!coordsSplit || !playerRadius || !barbRadius) return
    return {
      x: parseInt(coordsSplit.x),
      y: parseInt(coordsSplit.y),
      playerRadius: parseInt(playerRadius),
      barbRadius: parseInt(barbRadius),
    }
  }
}

export const settings = new Settings('settings', headers)
