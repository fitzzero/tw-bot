import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

export interface DocumentsData extends BaseSheetModel {
  id: string
  value: string | number | boolean
}

const headers = keys<DocumentsData>()

export const settings = new SheetData({ title: 'settings', headers })
