import { ConquerData } from '../../sheet/conquers'
import { PlayerData, players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { logDev } from '../../utility/logger'

export const conquerAlerts = async (conquer: ConquerData) => {
  let tracking = false
  const newPlayer = players.getById(conquer.newPlayer)
  let oldPlayer: PlayerData | undefined = undefined
  if (conquer.oldPlayer != '0') oldPlayer = players.getById(conquer.newPlayer)
  if (!newPlayer) return

  const tribe = tribes.getById(newPlayer.tribe)
  tracking =
    newPlayer.name === settings.getValue(WRSettings.account) ||
    !!tribe?.tracking

  if (tracking) {
    logDev(`${newPlayer.name} conquered ${oldPlayer}`)
  }
}
