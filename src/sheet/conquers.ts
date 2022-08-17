import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface ConquerData extends RowStructure {
  id: string
  unix: string
  newPlayer: string
  oldPlayer: string
}

const headers = keys<ConquerData>().map(key => key.toString())

class Conquers extends SheetData<ConquerData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }
}

export const conquers = new Conquers('conquers', headers)
