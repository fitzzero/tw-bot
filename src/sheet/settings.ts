import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

interface BaseDocumentData {
  id: string
  value: string | number | boolean
}

export interface DocumentData extends BaseDocumentData, BaseSheetModel {}

const headers = keys<BaseDocumentData>()

export const settings = new SheetData<DocumentData>({
  title: 'settings',
  headers,
})
