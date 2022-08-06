import { MessageOptions } from 'discord.js'
import { PlayerData, players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { VillageData } from '../../sheet/villages'
import { WRColors } from '../colors'

export interface VillageMessageProps {
  color?: WRColors
  content?: string
  description?: string
  isTodo?: boolean
  village: VillageData
}

export const villageMessage = ({
  village,
  description,
  color = WRColors.purple,
  isTodo = false,
  content = '',
}: VillageMessageProps) => {
  const world = settings.getValue(WRSettings.world)
  const points = parseInt(village.points)
  const isBarb = village.playerId == '0'
  let player: PlayerData | undefined = undefined
  if (!isBarb) {
    player = players.getById(village.playerId)
  }
  const imagePrefix = isBarb ? 'barb' : 'village'
  if (!color && isBarb) color = WRColors.gray
  let imageSuffix = 'Small'
  if (points >= 9000) {
    imageSuffix = 'Max'
  } else if (points >= 3000) {
    imageSuffix = 'Large'
  } else if (points >= 1000) {
    imageSuffix = 'Med'
  }
  const villageName = village.name.replace('+', ' ')
  const image = `https://fitzzero.sirv.com/tribalwars/tw-bot/${imagePrefix}${imageSuffix}.png`
  const url = `https://us${world}.tribalwars.us/game.php?screen=info_village&id=${village.id}#${village.x};${village.y}`

  if (description && !isBarb) {
    description += '\n'
  } else if (!isBarb) {
    description = ''
  }
  if (player) {
    const playerUrl = `https://us${world}.tribalwars.us/game.php?screen=info_player&id=${village.playerId}#${village.x};${village.y}`
    description += `Owned by [${player.name} (${player.points} pts)](${playerUrl})`
  }
  if (player && player.tribe != '0') {
    const tribe = tribes.getById(player.tribe)
    const tribeTag = tribe?.tag?.split('%')[0]
    const tribeUrl = `https://us${world}.tribalwars.us/game.php?screen=info_ally&id=${tribe?.id}`
    description += ` of [${tribeTag} (rank ${tribe?.rank})](${tribeUrl})`
  }

  const options: MessageOptions = {
    content,
    tts: false,
    embeds: [
      {
        title: `${villageName} ${village.x}|${village.y} (${village.points} pts)`,
        description,
        color,
        thumbnail: {
          url: image,
          height: 0,
          width: 0,
        },
        url,
      },
    ],
  }

  if (isTodo) {
    options.components = [
      {
        type: 1,
        components: [
          {
            style: 3,
            label: `Complete`,
            custom_id: `todo-complete`,
            type: 2,
          },
          {
            style: 4,
            label: `Delete`,
            custom_id: `todo-delete`,
            type: 2,
          },
        ],
      },
    ]
  }

  return options
}
