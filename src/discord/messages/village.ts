import { MessageOptions } from 'discord.js'
import { storagePath } from '../../config'
import { PlayerData, players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { TribeData, tribes } from '../../sheet/tribes'
import { getVillageSize, VillageData } from '../../sheet/villages'
import { worldPath } from '../../tw/world'
import { WRColors } from '../colors'

export interface VillageMessageProps {
  color?: WRColors
  content?: string
  description?: string
  isTodo?: boolean
  player?: PlayerData
  tribe?: TribeData
  village: VillageData
}

export const villageMessage = ({
  color = WRColors.purple,
  content = '',
  description = '',
  isTodo = false,
  player,
  tribe,
  village,
}: VillageMessageProps) => {
  // Meta data
  const world = settings.getValue(WRSettings.world)
  const isBarb = village.playerId == '0'
  const imagePrefix = isBarb ? 'barb' : 'village'
  const imageSuffix = getVillageSize(village.points)
  const villageName = village.name.replace('+', ' ')
  const image = `${storagePath}${imagePrefix}${imageSuffix}.png`
  const url = `${worldPath()}game.php?screen=info_village&id=${village.id}#${
    village.x
  };${village.y}`

  // Get PlayerData if exists (and override not provided)
  if (!player || !isBarb) {
    player = players.getById(village.playerId)
  }
  // Get TribeData if Exists (and override not provided)
  if (!tribe && player && player.tribe != '0') {
    tribe = tribes.getById(player.tribe)
  }

  // Set Default Color if not provided
  if (!color && isBarb) {
    color = WRColors.gray
  }

  // Append PlayerData to description
  if (player) {
    const playerUrl = `${worldPath()}game.php?screen=info_player&id=${
      village.playerId
    }#${village.x};${village.y}`
    description += `\nOwned by [${player.name} (${player.points} pts)](${playerUrl})`
  }
  // Append TribeData to description
  if (tribe) {
    const tribeTag = tribe?.tag?.split('%')[0]
    const tribeUrl = `${worldPath()}game.php?screen=info_ally&id=${tribe?.id}`
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
