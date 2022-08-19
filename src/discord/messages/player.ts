import { PlayerData } from '../../sheet/players'
import { tribes } from '../../sheet/tribes'
import { VillageData } from '../../sheet/villages'
import { getPlayerUrl } from '../../tw/player'
import { getTribeUrl } from '../../tw/tribe'
import { nFormatter } from '../../utility/numbers'

interface GetPlayerMdProps {
  player: PlayerData
  village?: VillageData
  includeTribe?: boolean
}

export const getPlayerMd = ({
  player,
  village,
  includeTribe = true,
}: GetPlayerMdProps) => {
  const playerUrl = getPlayerUrl(player.id, village)
  const tribe = tribes.getById(player.tribe)
  const points = nFormatter(parseInt(player.points))
  let markdown = `[${player.name} (${points} pts)](${playerUrl})`

  if (tribe && includeTribe) {
    const tribeUrl = getTribeUrl(tribe.id)
    markdown += ` of [${tribe?.tag} (rank ${tribe?.rank})](${tribeUrl})`
  }

  return markdown
}
