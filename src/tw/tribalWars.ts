import { LoopFn } from '../loop'
import { World } from '../types/world'
import { syncPlayers } from './player'
import { syncTribes } from './tribe'
import { syncVillages } from './village'

export interface TwProps {
  world: World
}

export const syncTw: LoopFn = async ({ world }) => {
  syncPlayers({ world })
  syncVillages({ world })
  syncTribes({ world })
}
