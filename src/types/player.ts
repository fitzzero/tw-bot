import { Document } from 'mongoose'
import { Moment } from 'moment'

export type Player = PlayerData & Document

export interface PlayerHistoric extends Omit<PlayerData, '_id'> {
  playerId: string
}

export interface PlayerData {
  _id: string
  name: string
  tribe: string
  villages: number
  points: number
  rank: number | null
  lastSync: Moment
}
