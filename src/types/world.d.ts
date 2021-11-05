import { Document } from 'mongoose'
import { Moment } from 'moment'

export interface World extends WorldEditProps, Document {
  _id: number
  name: string
  lastSync: Moment
  testData: boolean
  dashboard?: DashboardMessage[]
}

export interface GetWorld {
  id: number
}

export interface WorldEditProps {
  start?: Coordinate
  radius?: number
  roles?: {
    app: string
    browser: string
  }
}

export interface Coordinate {
  x: number
  y: number
}

export interface DashboardMessage {
  key: string
  channelId: string
  messageId: string
  data: Schema.Types.Mixed
}
