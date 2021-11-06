import { Moment } from 'moment'
import { Document } from 'mongoose'

export interface Tracker extends TrackerData, Document {
  _id: string
  lastSync: Moment
}

export interface TrackerData {
  discord: {
    messageId?: string
  }
  history: TrackerHistory[]
  type: TrackerTypes
  targetId: string
  targetType: TrackerTargetTypes
}

export interface TrackerCategory {
  discord: {
    channelId: string
    threadId: string
  }
  type: TrackerTypes
}

export interface TrackerHistory {
  time: Moment
  message: string
}

export type TrackerTargetTypes = 'village' | 'player' | 'tribe' | 'radius'

export type TrackerTypes =
  | 'radius'
  | 'farm'
  | 'target'
  | 'self'
  | 'ally'
  | 'enemy'
