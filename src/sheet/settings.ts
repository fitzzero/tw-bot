import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface SettingsData extends RowStructure {
  id: string
  value: string
}

const headers = keys<SettingsData>().map(key => key.toString())

export const settings = new SheetData<SettingsData>('settings', headers)
