import { Document } from 'mongoose'
import { Moment } from 'moment'

export interface World extends Document {
  _id: number
  name: string
  lastSync: Moment
  testData: boolean
  start: Coordinate | undefined
  radius: number
}

export interface UpdateWorld {
  start?: Coordinate
  radius?: number
}

export interface Coordinate {
  x: number
  y: number
}
