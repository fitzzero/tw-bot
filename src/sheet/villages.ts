import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

interface BaseVillageData {
  id: string
  name: string
  x: number
  y: number
  k: number
  playerId: string
  points: number
  rank: number
}

export interface VillageData extends BaseVillageData, BaseSheetModel {}

const headers = keys<BaseVillageData>()

export const villages = new SheetData<VillageData>({
  title: 'villages',
  headers,
})
