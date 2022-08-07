import { settings } from '../sheet/settings'
import { VillageData } from '../sheet/villages'
import { worldPath } from './world'

export const getDistance = (village: VillageData) => {
  const alertSettings = settings.getAlertSettings()
  if (!alertSettings) return
  const xDistance = alertSettings.x - parseInt(village.x)
  const yDistance = alertSettings.y - parseInt(village.y)
  const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  return distance
}

export const inAlertRange = (village: VillageData) => {
  const alertSettings = settings.getAlertSettings()
  const distance = getDistance(village)
  if (!distance || !alertSettings) return
  if (village.playerId == '0' && distance < alertSettings.barbRadius) {
    // console.log(
    //   `${village.name} (${village.x}|${village.y}) is ${distance} away`
    // )
    return true
  }
  if (distance < alertSettings.playerRadius) {
    // console.log(
    //   `${village.name} (${village.x}|${village.y}) is ${distance} away`
    // )
    return true
  }
  return false
}

export const getVillageSize = (points: string) => {
  const value = parseInt(points)
  if (value >= 9000) return 'Max'
  if (value >= 3000) return 'Large'
  if (value >= 1000) return 'Med'
  return 'Small'
}

export const getVillageUrl = (village: VillageData) => {
  return `${worldPath()}game.php?screen=info_village&id=${village.id}#${
    village.x
  };${village.y}`
}

export const splitCoords = (coords: string) => {
  const coordsSplit = coords.split('|')
  if (!coordsSplit?.[1]) return
  return {
    x: coordsSplit[0],
    y: coordsSplit[1],
  }
}
