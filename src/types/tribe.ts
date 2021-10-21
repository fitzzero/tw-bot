import { Document } from 'mongoose'
import { Moment } from 'moment'

export type Tribe = TribeData & Document

export interface TribeHistoric extends Omit<TribeData, '_id'> {
  tribeId: string
}

export interface TribeData {
  _id: string
  name: string
  tag: string
  members: number
  villages: number
  points: number
  allPoints: number
  rank: number | null
  od: number
  oda: number
  odd: number
  lastSync: Moment
}
