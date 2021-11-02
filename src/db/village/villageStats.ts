import { isDev } from '../../config'
import { villageAlert } from '../../discord/villageAlert'
import { getActiveWorld } from '../../loop'
import { Fn, PromiseFn } from '../../types/methods'
import {
  Village,
  VillageStats,
  RunVillageStats,
  VillageData,
} from '../../types/village'
import { Coordinate } from '../../types/world'
import { logger } from '../../utility/logger'
import { coordinatesInRange } from '../../utility/twUtility'

let initialized = false
let testData = false
let start: Coordinate | undefined = undefined
let radius: number | undefined = undefined
let foundInRange = 0

export const villagesInRange = (): number => foundInRange

const initStatsConfig: PromiseFn<void, void> = async () => {
  const world = getActiveWorld()
  if (isDev || world?.testData) {
    start = { x: 500, y: 500 }
    radius = 10
    testData = true
    initialized = true
    logger({ prefix: 'success', message: `World: Using test stat values` })
  } else if (!world?.radius || !world?.start) {
    initialized = true
    logger({
      prefix: 'alert',
      message: `World: No start and radius values, skipping stats`,
    })
  } else {
    initialized = true
    start = world.start
    radius = world.radius
  }
  return
}

interface StatAlerts {
  village: Village
  newData: VillageData
}
const statAlerts: PromiseFn<StatAlerts, void> = async ({
  village,
  newData,
}) => {
  if (!village.stats || !newData.stats || village.playerId === '0') return
  if (!initialized) {
    await initStatsConfig()
  }
  if (!start || !radius) {
    return
  }
  if (!coordinatesInRange(start, radius, { x: village.x, y: village.y })) {
    return
  }

  const newStats = newData.stats
  const oldStats = village.stats

  // Tests
  if (foundInRange === 0 && testData) {
    newStats.lastPointDecrease = 0
    oldStats.lastPointDecrease = 1
    newData.points = newData.points - 123
  }
  if (foundInRange === 1 && testData) {
    oldStats.stale = true
    newStats.stale = false
  }
  if (foundInRange === 2 && testData) {
    oldStats.stale = false
    newStats.stale = true
  }

  foundInRange++

  // Inactive
  if (newStats.stale && !oldStats?.stale) {
    villageAlert({
      message: `Has gone inactive`,
      village: newData,
      color: 'white',
    })
  }

  // Active
  if (!newStats.stale && oldStats?.stale) {
    villageAlert({
      message: `No longer inactive`,
      village: newData,
      color: 'yellow',
    })
  }

  // Dropped
  if (newStats.lastPointDecrease === 0 && oldStats.lastPointDecrease > 0) {
    villageAlert({
      message: `Just dropped points`,
      village: newData,
      color: 'red',
      fields: [
        {
          name: 'Points Lost',
          value: `${village.points - newData.points}`,
          inline: true,
        },
        {
          name: 'Original Points',
          value: `${village.points}`,
          inline: true,
        },
      ],
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

  newData.stats = newStats
  statAlerts({ village, newData })
  village.stats = newStats

  return village
}

export const getStartDistance = (check: Coordinate): string | undefined => {
  if (!start) return

  const distanceA = Math.abs(check.x - start.x)
  const distanceB = Math.abs(check.y - start.y)

  const distanceC = Math.round(
    Math.sqrt(Math.pow(distanceA, 2) + Math.pow(distanceB, 2))
  )

  return distanceC.toString()
}
