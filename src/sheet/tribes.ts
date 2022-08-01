import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

interface BaseTribeData {
  id: string
  name: string
  tag: string
  members: number
  villages: number
  points: number
  allPoints: number
  rank: number
  od: number
  oda: number
  odd: number
}

export interface TribeData extends BaseTribeData, BaseSheetModel {}

const headers = keys<BaseTribeData>()

export const tribes = new SheetData<TribeData>({
  title: 'tribes',
  headers,
})
