import { channels, WRChannels } from '../../sheet/channels'
import { ConquerData } from '../../sheet/conquers'
import { PlayerData, players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { villages } from '../../sheet/villages'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

export const conquerAlerts = async (conquer: ConquerData) => {
  let tracking = false
  const village = villages.getById(conquer.id)
  const newPlayer = players.getById(conquer.newPlayer)
  const oldPlayer = players.getById(conquer.newPlayer)
  const isBarb = conquer.oldPlayer === '0'

  if (!newPlayer || !village) return

  const tribe = tribes.getById(newPlayer.tribe)
  tracking =
    newPlayer.name === settings.getValue(WRSettings.account) ||
    !!tribe?.tracking

  if (tracking) {
    const tribe = tribes.getById(newPlayer.tribe)
    let conquered = isBarb ? 'Barbarians' : `${oldPlayer?.name}`
    if (tribe) conquered += `(${tribe.tag})`
    const payload = villageMessage({
      color: WRColors.gray,
      description: `Has been taken from: ${conquered})`,
      village,
    })
    await channels.sendMessage(WRChannels.news, payload)
  }
}
