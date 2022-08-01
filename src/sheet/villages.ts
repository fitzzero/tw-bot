import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

export interface VillageData extends BaseSheetModel {
  id: string
  name: string
  x: number
  y: number
  k: number
  playerId: string
  points: number
  rank: number
}

const headers = keys<VillageData>().map(key => key.toString())

export const villages = new SheetData<VillageData>('villages', headers)
