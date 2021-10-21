import { Document } from 'mongoose'
import { Moment } from 'moment'

export interface World extends Document {
  _id: number
  lastSync: Moment
  inSync: boolean
  testData: boolean
}
