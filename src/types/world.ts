import { Document } from 'mongoose'
import { Moment } from 'moment'
import { Village } from './village'

export interface World extends Document {
  _id: number
  villages: [Village]
  lastSync: Moment
  inSync: boolean
}
