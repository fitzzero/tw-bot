import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

export interface SettingsData extends BaseSheetModel {
  id: string
  value: string
}

const headers = keys<SettingsData>().map(key => key.toString())

export const settings = new SheetData<SettingsData>('settings', headers)
