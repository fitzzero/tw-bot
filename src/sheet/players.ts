import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface PlayerData extends RowStructure {
  id: string
  name: string
  tribe: string
  villages: string
  points: string
  rank: string
  od: string
  oda: string
  odd: string
  ods: string
}

const headers = keys<PlayerData>().map(key => key.toString())

export const players = new SheetData<PlayerData>('players', headers)
