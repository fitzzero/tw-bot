import { PlayerData } from '../../sheet/players'
import { tribes } from '../../sheet/tribes'
import { VillageData } from '../../sheet/villages'
import { getPlayerUrl } from '../../tw/player'
import { getTribeUrl } from '../../tw/tribe'

export const getPlayerMd = (player: PlayerData, village?: VillageData) => {
  const playerUrl = getPlayerUrl(player.id, village)
  const tribe = tribes.getById(player.tribe)
  let markdown = `[${player.name} (${player.points} pts)](${playerUrl})`
  if (tribe) {
    const tribeUrl = getTribeUrl(tribe.id)
    markdown += ` of [${tribe?.tag} (rank ${tribe?.rank})](${tribeUrl})`
  }

  return markdown
}
