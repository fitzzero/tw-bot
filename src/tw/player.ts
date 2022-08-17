import { VillageData } from '../sheet/villages'
import { worldPath } from './world'

export const getPlayerUrl = (id: string, village?: VillageData) => {
  let url = `${worldPath()}game.php?screen=info_player&id=${id}`
  if (village) url += `#${village.x};${village.y}`
  return url
}
