import { MessageOptions } from 'discord.js'
import { isEmpty } from 'lodash'
import { storagePath } from '../../config'
import { PlayerData, players } from '../../sheet/players'
import { VillageData } from '../../sheet/villages'
import { getVillageSize, getVillageUrl } from '../../tw/village'
import { WRColors } from '../colors'
import { MessageProps } from './message'
import { getPlayerMd } from './player'

export interface VillageMessageProps extends MessageProps {
  extraContext?: boolean
  player?: PlayerData
  village: VillageData
}

export const villageMessage = ({
  color = WRColors.purple,
  content = '',
  components = [],
  description = '',
  extraContext = true,
  footer,
  image,
  player,
  timestamp,
  village,
}: VillageMessageProps) => {
  // Meta data
  const isBarb = village.playerId == '0'
  const imagePrefix = isBarb ? 'barb' : 'village'
  const imageSuffix = getVillageSize(village.points)
  const thumbnail = `${storagePath}${imagePrefix}${imageSuffix}.png`
  const url = getVillageUrl(village)

  // Get PlayerData if exists (and override not provided)
  if (!player || !isBarb) {
    player = players.getById(village.playerId)
  }

  // Set Default Color if not provided
  if (!color && isBarb) {
    color = WRColors.gray
  }

  // Append PlayerData to description
  if (player && extraContext) {
    const playerMd = getPlayerMd({ player, village })
    description += `\nOwned by ${playerMd}`
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
          url: thumbnail,
          height: 0,
          width: 0,
        },
        image: image ? { url: image } : undefined,
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
