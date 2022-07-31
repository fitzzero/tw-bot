import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

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

const headers = keys<PlayerData>()

export const players = new SheetData({ title: 'players', headers })
