import { APIEmbedField } from 'discord-api-types'
import { keys } from 'ts-transformer-keys'
import { stonksMessage } from '../discord/messages/stonks'
import { channels, WarRoomChannels } from './channels'
import { settings, WarRoomSettings } from './settings'
import { RowStructure, SheetData } from './sheetData'

export interface PlayerData extends RowStructure {
  id: string
  name: string
  tribe: string
  villages: string
  points: string
  rank: string
  od: string
  oda: string
  odd: string
  ods: string
}

const headers = keys<PlayerData>().map(key => key.toString())

class Players extends SheetData<PlayerData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  auditAndUpdate = async (newData: PlayerData) => {
    const existingData = this.getById(newData.id)
    if (!existingData) {
      await this.add(newData)
      return
    }
    // Update data
    this.update({ ...newData })

    // If account
    if (newData.name == settings.getSettingValue(WarRoomSettings.account)) {
      accountChangeAlerts(newData, existingData)
    }
  }
}

export const players = new Players('players', headers)

const accountChangeAlerts = async (
  newData: PlayerData,
  oldData: PlayerData
) => {
  let update = false
  let goodChanges = 0
  const fields: APIEmbedField[] = []
  const propsToCheck = ['villages', 'rank', 'od']
  propsToCheck.forEach(prop => {
    const oldVal = parseInt(oldData[prop])
    const newVal = parseInt(newData[prop])
    if (oldVal != newVal) {
      update = true
      fields.push({
        name: prop,
        value: `~~${oldData[prop]}~~ -> **${newData[prop]}**`,
      })
    }
    newVal > oldVal ? ++goodChanges : --goodChanges
  })
  if (!update) return

  const message = stonksMessage({
    title: `${newData.name}`,
    url: `https://www.twstats.com/usc1/index.php?page=player&id=${newData.id}`,
    fields,
    positive: goodChanges > 0,
  })
  await channels.sendMessage(WarRoomChannels.news, message)
}
