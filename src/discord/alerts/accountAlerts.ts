import { APIEmbedField } from 'discord.js'
import { channels, WRChannels } from '../../sheet/channels'
import { PlayerData } from '../../sheet/players'
import { stonksMessage } from '../messages/stonks'

export const accountChangeAlerts = async (
  newData: PlayerData,
  oldData: PlayerData
) => {
  let update = false
  let goodChanges = 0
  const fields: APIEmbedField[] = []

  const propsToCheck = [
    { name: 'villages', increaseGood: true },
    { name: 'rank', increaseGood: false },
    { name: 'od', increaseGood: true },
  ]
  propsToCheck.forEach(prop => {
    const oldVal = parseInt(oldData[prop.name])
    const newVal = parseInt(newData[prop.name])
    if (oldVal != newVal) {
      update = true
      fields.push({
        name: prop.name,
        value: `~~${oldVal}~~ -> **${newVal}**`,
        inline: true,
      })
      if (prop.increaseGood) {
        newVal > oldVal ? ++goodChanges : --goodChanges
      } else {
        newVal > oldVal ? --goodChanges : ++goodChanges
      }
    }
  })
  if (!update) return

  const message = stonksMessage({
    title: `${newData.name}`,
    url: `https://www.twstats.com/usc1/index.php?page=player&id=${newData.id}`,
    fields,
    positive: goodChanges > 0,
  })
  await channels.sendMessage(WRChannels.news, message)
}
