import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface ReportData extends RowStructure {
  id: string
  villageId: string
  url: string
  path: string
}

const headers = keys<ReportData>().map(key => key.toString())

class Reports extends SheetData<ReportData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }
}

export const reports = new Reports('reports', headers)
