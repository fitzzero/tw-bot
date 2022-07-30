import { Moment } from 'moment'
import { SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

export interface PlayerData {
  _id: string
  name: string
  tribe: string
  villages: number
  points: number
  rank: number | null
  od: number
  oda: number
  odd: number
  ods: number
  lastSync: Moment
}

const headers = keys<PlayerData>()

export const players = new SheetData({ title: 'players', headers })
