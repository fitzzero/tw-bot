import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

export interface TribeData extends BaseSheetModel {
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

const headers = keys<TribeData>().map(key => key.toString())

export const tribes = new SheetData<TribeData>('tribes', headers)
