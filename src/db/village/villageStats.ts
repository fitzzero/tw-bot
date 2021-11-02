import { discordAlert } from '../../discord/alert'
import { getActiveWorld } from '../../loop'
import { Fn, PromiseFn } from '../../types/methods'
import { Village, VillageStats, RunVillageStats } from '../../types/village'
import { Coordinate } from '../../types/world'
import { logger } from '../../utility/logger'
import { coordinatesInRange } from '../../utility/twUtility'

let initialized = false
let testData = false
let start: Coordinate | undefined = undefined
let radius: number | undefined = undefined
let foundInRange = 0

export const villagesInRange = (): number => foundInRange

const getStatConfig: PromiseFn<void, void> = async () => {
  const world = getActiveWorld()
  if (world?.testData) {
    start = { x: 500, y: 500 }
    radius = 10
    testData = true
    logger({ prefix: 'success', message: `World: Using test stat values` })
  } else if (!world?.radius || !world?.start) {
    initialized = true
    logger({
      prefix: 'alert',
      message: `World: No start and radius values, skipping stats`,
    })
  } else {
    start = world.start
    radius = world.radius
  }
  return
}

interface StatAlerts {
  village: Village
  newStats: VillageStats
}
const statAlerts: PromiseFn<StatAlerts, void> = async ({
  village,
  newStats,
}) => {
  if (!village.stats) return
  if (!initialized) {
    await getStatConfig()
  }
  if (!start || !radius) {
    return
  }
  if (!coordinatesInRange(start, radius, { x: village.x, y: village.y })) {
    return
  }

  if (foundInRange === 0 && testData) {
    newStats.lastPointDecrease = 0
  }
  if (foundInRange === 1 && testData) {
    village.stats.stale = true
  }
  if (foundInRange === 2 && testData) {
    newStats.stale = true
    village.stats.stale = false
  }
  const oldStats = village.stats
  foundInRange++
  if (newStats.stale && !oldStats?.stale) {
    discordAlert({
      message: `Village: ${village._id} (${village.name}) has gone inactive`,
    })
  }
  if (!newStats.stale && oldStats?.stale) {
    discordAlert({
      message: `Village: ${village._id} (${village.name}) no longer inactive`,
    })
  }
  if (newStats.lastPointDecrease === 0 && oldStats.lastPointDecrease > 0) {
    discordAlert({
      message: `Village: ${village._id} (${village.name}) has just dropped points`,
    })
  }

  return
}

export const addVillageStats: Fn<RunVillageStats, Village> = ({
  village,
  newData,
}) => {
  let lastPointIncrease = village.stats?.lastPointIncrease || 0
  let lastPointDecrease = village.stats?.lastPointDecrease || 0
  let stale = false
  if (village.points === newData.points) {
    lastPointIncrease++
    lastPointDecrease++
  }
  if (newData.points > village.points) {
    lastPointIncrease = 0
  }
  if (newData.points < village.points) {
    lastPointDecrease = 0
  }
  if (lastPointIncrease > 24) {
    stale = true
  }

  const newStats: VillageStats = {
    lastPointIncrease,
    lastPointDecrease,
    stale,
  }

  statAlerts({ village, newStats })
  village.stats = newStats

  return village
}
