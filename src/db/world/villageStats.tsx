import { Coordinate } from '../../types/world'
import { Village, VillageStats } from '../../types/village'

let testData = false
let checkStats = true
let start: Coordinate | undefined = undefined
let radius: number | undefined = undefined
let foundInRange = 0

export const villagesInRange = (): number => foundInRange

const statAlerts = (village: Village, newStats: VillageStats): void => {
  if (!village.stats) return
  if (checkStats && !start) {
    const world = getActiveWorld()
    if (world?.testData) {
      start = { x: 500, y: 500 }
      radius = 10
      testData = true
      foundInRange = 0
      logger({ prefix: 'success', message: `World: Using test stat values` })
    } else if (!world?.radius || !world?.start) {
      checkStats = false
      logger({
        prefix: 'alert',
        message: `World: No start and radius values, skipping stats`,
      })
      return
    } else {
      start = world.start
      radius = world.radius
      foundInRange = 0
    }
  }
  if (!checkStats || !start || !radius) {
    return
  }
  if (coordinatesInRange(start, radius, { x: village.x, y: village.y })) {
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
  }

  return
}

export const stats: Fn<RunVillageStats, Village> = ({ village, newData }) => {
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

  statAlerts(village, newStats)
  village.stats = newStats

  return village
}