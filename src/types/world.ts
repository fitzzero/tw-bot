import { Document } from 'mongoose'
import { Moment } from 'moment'

export interface World extends Document {
  _id: number
  name: string
  lastSync: Moment
  testData: boolean
  start: Coordinate | undefined
}

export interface UpdateWorld {
  start: Coordinate | undefined
}

export interface Coordinate {
  x: number
  y: number
}
