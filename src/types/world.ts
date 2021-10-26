import { Document } from 'mongoose'
import { Moment } from 'moment'

export interface World extends Document {
  _id: number
  name: string
  lastSync: Moment
  testData: boolean
}
