import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

interface BasePlayerData {
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

export interface PlayerData extends BasePlayerData, BaseSheetModel {}

const headers = keys<BasePlayerData>()

export const players = new SheetData<PlayerData>({ title: 'players', headers })
