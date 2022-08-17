import { channels, WRChannels } from '../../sheet/channels'
import { ConquerData } from '../../sheet/conquers'
import { players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { villages } from '../../sheet/villages'
import { getPlayerUrl } from '../../tw/player'
import { getTribeUrl } from '../../tw/tribe'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

export const conquerAlerts = async (conquer: ConquerData) => {
  let tracking = false
  const village = villages.getById(conquer.villageId)
  const newPlayer = players.getById(conquer.newPlayer)
  const oldPlayer = players.getById(conquer.oldPlayer)

  if (!newPlayer || !village) return

  const tribe = tribes.getById(newPlayer.tribe)
  tracking =
    newPlayer.name === settings.getValue(WRSettings.account) ||
    !!tribe?.tracking

  if (tracking) {
    let conquered = 'Barbarians'
    if (oldPlayer) {
      const tribe = tribes.getById(oldPlayer.tribe)
      const playerUrl = getPlayerUrl(oldPlayer?.id, village)
      conquered = `[${oldPlayer?.name} (${oldPlayer.points} pts)](${playerUrl})`

      if (tribe) {
        const tribeUrl = getTribeUrl(tribe.id)
        conquered += ` of [${tribe.tag}](${tribeUrl})`
      }
    }
    const payload = villageMessage({
      color: WRColors.gray,
      description: `Has been taken from: ${conquered}`,
      village,
    })
    await channels.sendMessage(WRChannels.news, payload)
  }
}
