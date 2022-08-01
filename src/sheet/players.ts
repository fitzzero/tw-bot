import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

export interface PlayerData extends BaseSheetModel {
  id: string
  name: string
  tribe: string
  villages: number
  points: number
  rank: number
  od: number
  oda: number
  odd: number
  ods: number
}

const headers = keys<PlayerData>().map(key => key.toString())

export const players = new SheetData<PlayerData>('players', headers)
