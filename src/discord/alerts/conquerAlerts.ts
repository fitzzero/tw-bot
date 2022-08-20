import { channels, WRChannels } from '../../sheet/channels'
import { ConquerData } from '../../sheet/conquers'
import { players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { villages } from '../../sheet/villages'
import { WRColors } from '../colors'
import { getDiscordEmoji } from '../guild'
import { getPlayerMd } from '../messages/player'
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
    tribe?.tracking === 'TRUE'

  if (!tracking) return

  let newPlayerMd = getPlayerMd({ player: newPlayer, village })
  let oldPlayerMd = 'Barbarians'
  const emoji = await getDiscordEmoji('snob')
  if (oldPlayer) oldPlayerMd = getPlayerMd({ player: oldPlayer, village })

  const payload = villageMessage({
    color: WRColors.gray,
    description: `${emoji} Conquered: <t:${conquer.unix}:t> (<t:${conquer.unix}:R>)\nBy: ${newPlayerMd}\nFrom: ${oldPlayerMd}`,
    village,
    extraContext: false,
  })
  await channels.sendMessage(WRChannels.news, payload)
}
