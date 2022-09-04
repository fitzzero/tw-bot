import { AttachmentBuilder, Message, MessageOptions } from 'discord.js'
import { players } from '../../sheet/players'
import { reports } from '../../sheet/reports'
import { TWUnits, units } from '../../sheet/units'
import { getPlayerUrl } from '../../tw/player'
import {
  getDistance,
  getVillageUrl,
  parseVillageFromText,
} from '../../tw/village'
import { logAlert } from '../../utility/logger'
import { saveScreenshot } from '../../utility/screenshot'
import { minToDuration } from '../../utility/time'
import { getDiscordEmoji } from '../guild'
import { villageMessage } from '../messages/village'
import { MessageTrigger } from '../messageTrigger'

export const reportsPath = 'reports/'

const controller = async (message: Message) => {
  const url = message.content
  const id = message.content.split('/')[4]
  const { path, data } = await saveScreenshot({
    id: `${reportsPath}${id}`,
    url: message.content,
    width: 980,
    height: 1200,
    clipElement: ':nth-match(tbody, 5)',
    dataRequest: [
      { id: 'origin', locator: ':nth-match(.village_anchor, 1)' },
      { id: 'target', locator: ':nth-match(.village_anchor, 2)' },
      {
        id: TWUnits.snob,
        locator: ':nth-match(.unit-item-snob, 1)',
      },
      {
        id: TWUnits.ram,
        locator: ':nth-match(.unit-item-ram, 1)',
      },
      {
        id: TWUnits.sword,
        locator: ':nth-match(.unit-item-sword, 1)',
      },
      {
        id: TWUnits.axe,
        locator: ':nth-match(.unit-item-axe, 1)',
      },
      {
        id: TWUnits.light,
        locator: ':nth-match(.unit-item-light, 1)',
      },
      {
        id: TWUnits.spy,
        locator: ':nth-match(.unit-item-spy, 1)',
      },
    ],
  })

  // Build Message
  const image = new AttachmentBuilder(path)
  let payload: MessageOptions = {
    files: [image],
  }
  const originVillage = parseVillageFromText(data?.origin)
  const targetVillage = parseVillageFromText(data?.target)
  if (targetVillage) {
    // Target Info
    let description = ''

    const targetPlayer = players.getById(targetVillage.playerId)
    if (targetPlayer) {
      const playerUrl = getPlayerUrl(targetPlayer.id, targetVillage)
      description += `Owned by [${targetPlayer.name}](<${playerUrl}>)`
    }

    // Save Report
    reports.updateOrAdd({
      id,
      url,
      path,
      villageId: targetVillage.id,
    })

    // Origin Info
    if (originVillage) {
      const villageUrl = getVillageUrl(originVillage)
      description += `\nAttacked from [${originVillage.name}](<${villageUrl}>)`
      const originPlayer = players.getById(originVillage.playerId)
      if (originPlayer) {
        const playerUrl = getPlayerUrl(originPlayer.id, originVillage)
        description += ` ([${originPlayer.name}](<${playerUrl}>))`
      }
    }

    // Travel Stats
    if (originVillage && targetVillage) {
      const distance = getDistance(targetVillage, originVillage) || 0
      const compareUnits = [
        TWUnits.snob,
        TWUnits.ram,
        TWUnits.catapult,
        TWUnits.sword,
        TWUnits.axe,
        TWUnits.light,
        TWUnits.spy,
      ]
      for (const id of compareUnits) {
        const count = data[id]
        if (count && count != '' && count != '0') {
          const unitSpeed = Math.round(
            parseInt(units.getById(id)?.speed || '0') * distance
          )
          const emoji = await getDiscordEmoji(id)
          description += `\n~*${minToDuration(
            unitSpeed
          )}* ${emoji} travel (${Math.round(distance)} fields)`
          break
        }
      }
    }

    payload = villageMessage({
      description,
      extraContext: false,
      village: targetVillage,
      image: `attachment://${id}.png`,
      files: [image],
    })
  }

  await message.channel.send(payload)
  try {
    await message.delete()
  } catch (err) {
    logAlert(err)
  }
}

export const twReport: MessageTrigger = {
  customId: 'tribalwars.us/public_report/',
  controller,
}
