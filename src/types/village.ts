import { Moment } from 'moment'

export interface Village extends VillageHistoric {
  history: VillageHistoric[]
}

export interface VillageHistoric {
  _id: number
  name: string
  x: number
  y: number
  player: number
  points: number
  rank: number
  lastSync: Moment
}
