import { Document } from 'mongoose'
import { Moment } from 'moment'

export type Village = VillageData & Document

export interface VillageHistoric extends Omit<VillageData, '_id'> {
  villageId: string
}

export interface VillageData {
  _id: string
  name: string
  number: number
  x: number
  y: number
  k: number
  playerId: string
  points: number
  rank: number | null
  lastSync: Moment
  stats?: VillageStats
}

export interface VillageStats {
  lastPointDecrease: number
  lastPointIncrease: number
  stale: boolean
}

export interface RunVillageStats {
  village: Village
  newData: VillageData
}

export type GetVillage = (villageId: string) => Promise<Village | null>

export interface UpdateVillage {
  villageData: VillageData
}

export interface BulkUpdateVillage {
  newVillageData: VillageData[]
}

export interface RemoveVillage {
  village: Village
}
