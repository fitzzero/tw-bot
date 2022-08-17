import { APIEmbedField } from 'discord.js'
import { channels, WRChannels } from '../../sheet/channels'
import { PlayerData } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { stonksMessage } from '../messages/stonks'

export interface AccountChangeProps {
  newData: PlayerData
  oldData: PlayerData
  exclude?: string[]
  channel?: WRChannels
}

export const accountChangeAlerts = async ({
  channel = WRChannels.news,
  newData,
  oldData,
  exclude,
}: AccountChangeProps) => {
  let update = false
  let goodChanges = 0
  const fields: APIEmbedField[] = []

  const propsToCheck = [
    { name: 'villages', increaseGood: true, limiter: undefined },
    { name: 'rank', increaseGood: false, limiter: undefined },
    {
      name: 'oda',
      increaseGood: true,
      limiter: settings.getValue(WRSettings.odAlerts),
    },
    {
      name: 'odd',
      increaseGood: true,
      limiter: settings.getValue(WRSettings.odAlerts),
    },
    {
      name: 'ods',
      increaseGood: true,
      limiter: settings.getValue(WRSettings.odAlerts),
    },
  ]
  for (const prop of propsToCheck) {
    if (exclude?.includes(prop.name)) continue

    const oldVal = parseInt(oldData[prop.name])
    const newVal = parseInt(newData[prop.name])

    if (prop.limiter) {
      const alertRange = parseInt(prop.limiter)
      if (newVal - oldVal < alertRange) continue
    }

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
  }
  if (!update) return

  const message = stonksMessage({
    title: `${newData.name}`,
    url: `https://www.twstats.com/usc1/index.php?page=player&id=${newData.id}`,
    fields,
    positive: goodChanges > 0,
  })
  await channels.sendMessage(channel, message)
}
