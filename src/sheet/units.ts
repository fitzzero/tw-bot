import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface UnitData extends RowStructure {
  id: string
  img: string
  basetime: string
  speed: string
  pop: string
  emoji: string
}

const headers = keys<UnitData>().map(key => key.toString())

class Units extends SheetData<UnitData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }
}

export const units = new Units('units', headers)
