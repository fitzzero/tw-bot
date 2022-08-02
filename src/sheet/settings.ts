import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface SettingsData extends RowStructure {
  id: string
  value: string
}

const headers = keys<SettingsData>().map(key => key.toString())

class Settings extends SheetData<SettingsData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getSettingValue = (id: string) => {
    return this.getById(id)?.value
  }

  getAlertSettings = () => {
    const startX = this.getSettingValue('startX')
    const startY = this.getSettingValue('startY')
    const playerRadius = this.getSettingValue('playerRadius')
    const barbRadius = this.getSettingValue('barbRadius')
    if (!startX || !startY || !playerRadius || !barbRadius) return
    return {
      x: parseInt(startX),
      y: parseInt(startY),
      playerRadius: parseInt(playerRadius),
      barbRadius: parseInt(barbRadius),
    }
  }
}

export const settings = new Settings('settings', headers)
