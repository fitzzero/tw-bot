import { AttachmentBuilder, Message, MessageOptions } from 'discord.js'
import { players } from '../../sheet/players'
import { getPlayerUrl } from '../../tw/player'
import { getVillageUrl, parseVillageFromText } from '../../tw/village'
import { saveScreenshot } from '../../utility/screenshot'
import { villageMessage } from '../messages/village'
import { MessageTrigger } from '../messageTrigger'

const controller = async (message: Message) => {
  const { path, data } = await saveScreenshot({
    id: 'report',
    url: message.content,
    width: 980,
    height: 690,
    clipElement: ':nth-match(tbody, 5)',
    dataRequest: [
      { id: 'origin', locator: ':nth-match(.village_anchor, 1) > a' },
      { id: 'target', locator: ':nth-match(.village_anchor, 2) > a' },
    ],
  })
  const image = new AttachmentBuilder(path)
  let payload: MessageOptions = {
    files: [image],
  }
  const originVillage = parseVillageFromText(data?.origin)
  const targetVillage = parseVillageFromText(data?.targetVillage)
  if (targetVillage) {
    let description = ''

    const targetPlayer = players.getById(targetVillage.playerId)
    if (targetPlayer) {
      const playerUrl = getPlayerUrl(targetPlayer.id, targetVillage)
      description += `Owned by [${targetPlayer.name}](<${playerUrl}>)`
    }

    if (originVillage) {
      const villageUrl = getVillageUrl(originVillage)
      description += `Attacked from [${originVillage.name}](<${villageUrl}>)`
      const originPlayer = players.getById(originVillage.playerId)
      if (originPlayer) {
        const playerUrl = getPlayerUrl(originPlayer.id, originVillage)
        description += `([${originPlayer.name}](<${playerUrl}>))`
      }
    }
    payload = villageMessage({
      description,
      extraContext: false,
      village: targetVillage,
      image: 'attachment://report.png',
    })
    payload.files = [image]
  }

  await message.channel.send(payload)
  await message.delete()
}

export const twReport: MessageTrigger = {
  customId: 'tribalwars.us/public_report/',
  controller,
}
