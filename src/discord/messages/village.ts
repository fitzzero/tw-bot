import { APIButtonComponentWithCustomId, MessageOptions } from 'discord.js'
import { isEmpty } from 'lodash'
import { storagePath } from '../../config'
import { PlayerData, players } from '../../sheet/players'
import { TribeData, tribes } from '../../sheet/tribes'
import { VillageData } from '../../sheet/villages'
import { getVillageSize, getVillageUrl } from '../../tw/village'
import { worldPath } from '../../tw/world'
import { WRColors } from '../colors'

export interface VillageMessageProps {
  color?: WRColors
  content?: string
  components?: APIButtonComponentWithCustomId[]
  description?: string
  extraContext?: boolean
  footer?: string
  player?: PlayerData
  timestamp?: string
  tribe?: TribeData
  village: VillageData
}

export const villageMessage = ({
  color = WRColors.purple,
  content = '',
  components = [],
  description = '',
  extraContext = true,
  footer,
  player,
  timestamp,
  tribe,
  village,
}: VillageMessageProps) => {
  // Meta data
  const isBarb = village.playerId == '0'
  const imagePrefix = isBarb ? 'barb' : 'village'
  const imageSuffix = getVillageSize(village.points)
  const image = `${storagePath}${imagePrefix}${imageSuffix}.png`
  const url = getVillageUrl(village)

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
  if (player && extraContext) {
    const playerUrl = `${worldPath()}game.php?screen=info_player&id=${
      village.playerId
    }#${village.x};${village.y}`
    description += `\nOwned by [${player.name} (${player.points} pts)](${playerUrl})`
  }
  // Append TribeData to description
  if (tribe && extraContext) {
    const tribeUrl = `${worldPath()}game.php?screen=info_ally&id=${tribe?.id}`
    description += ` of [${tribe?.tag} (rank ${tribe?.rank})](${tribeUrl})`
  }

  const options: MessageOptions = {
    content,
    tts: false,
    embeds: [
      {
        title: `${village.name} ${village.x}|${village.y} (${village.points} pts)`,
        description,
        color,
        thumbnail: {
          url: image,
          height: 0,
          width: 0,
        },
        url,
        footer: footer
          ? {
              text: footer,
            }
          : undefined,
        timestamp,
      },
    ],
  }

  if (!isEmpty(components)) {
    options.components = [
      {
        type: 1,
        components,
      },
    ]
  }

  return options
}
