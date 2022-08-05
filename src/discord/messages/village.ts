import { MessageOptions } from 'discord.js'
import { PlayerData, players } from '../../sheet/players'
import { settings, WarRoomSettings } from '../../sheet/settings'
import { tribes } from '../../sheet/tribes'
import { VillageData } from '../../sheet/villages'
import { colors } from '../colors'

export const villageMessage = (
  village: VillageData,
  description?: string,
  color = colors.purple
) => {
  const world = settings.getValue(WarRoomSettings.world)
  const points = parseInt(village.points)
  const isBarb = village.playerId == '0'
  let player: PlayerData | undefined = undefined
  if (!isBarb) {
    player = players.getById(village.playerId)
  }
  const imagePrefix = isBarb ? 'barb' : 'village'
  if (!color && isBarb) color = colors.gray
  let imageSuffix = 'Small'
  if (points >= 9000) {
    imageSuffix = 'Max'
  } else if (points >= 3000) {
    imageSuffix = 'Large'
  } else if (points >= 1000) {
    imageSuffix = 'Med'
  }
  const image = `https://fitzzero.sirv.com/tribalwars/tw-bot/${imagePrefix}${imageSuffix}.png`
  const url = `https://us${world}.tribalwars.us/game.php?village=${village.id}&screen=info_village&id=53#${village.x};${village.y}`

  if (description && !isBarb) {
    description += '\n'
  } else if (!isBarb) {
    description = ''
  }
  if (player) {
    const playerUrl = `https://us${world}.tribalwars.us/game.php?village=${village.id}&screen=info_player&id=${village.playerId}#${village.x};${village.y}`
    description += `Owned by [${player.name} (${player.points} pts)](${playerUrl})`
  }
  if (player && player.tribe != '0') {
    const tribe = tribes.getById(player.tribe)
    const tribeTag = tribe?.tag?.split('%')[0]
    const tribeUrl = `https://us${world}.tribalwars.us/game.php?village=${village.id}&screen=info_ally&id=${tribe?.id}`
    description += ` of [${tribeTag} (rank ${tribe?.rank})](${tribeUrl})`
  }

  const options: MessageOptions = {
    content: '',
    tts: false,
    embeds: [
      {
        title: `${village.name.replace('+', ' ')} ${village.x}|${village.y} (${
          village.points
        } pts)`,
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

  return options
}
