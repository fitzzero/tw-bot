import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

export interface TribeData extends RowStructure {
  id: string
  name: string
  tag: string
  members: string
  villages: string
  points: string
  allPoints: string
  rank: string
  od: string
  oda: string
  odd: string
}

const headers = keys<TribeData>().map(key => key.toString())

export const tribes = new SheetData<TribeData>('tribes', headers)
