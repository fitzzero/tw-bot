import { MessageOptions } from 'discord.js'
import { settings, WarRoomSettings } from '../../sheet/settings'
import { VillageData } from '../../sheet/villages'
import { colors } from '../colors'

export const villageMessage = (
  village: VillageData,
  description: string,
  color = colors.purple
) => {
  const world = settings.getValue(WarRoomSettings.world)
  const points = parseInt(village.points)
  const imagePrefix = village.playerId == '0' ? 'barb' : 'village'
  let imageSuffix = 'Small'
  if (points >= 9000) {
    imageSuffix = 'Max'
  } else if (points >= 3000) {
    imageSuffix = 'Large'
  } else if (points >= 1000) {
    imageSuffix = 'Med'
  }
  const image = `https://fitzzero.sirv.com/tribalwars/tw-bot/${imagePrefix}${imageSuffix}.png`
  const options: MessageOptions = {
    content: '',
    tts: false,
    embeds: [
      {
        title: `${village.name} (${village.x}|${village.y})`,
        description: description,
        color: 0x070a06,
        thumbnail: {
          url: image,
          height: 0,
          width: 0,
        },
        url: `https://us${world}.tribalwars.us/game.php?village=${village.id}&screen=info_village&id=53#${village.x};${village.y}`,
      },
    ],
  }

  return options
}
