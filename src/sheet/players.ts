import { keys } from 'ts-transformer-keys'
import { accountChangeAlerts } from '../discord/alerts/accountAlerts'
import { settings, WRSettings } from './settings'
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
    const oldData = this.getById(newData.id)
    if (!oldData) {
      await this.add(newData)
      return
    }
    // Update data
    await this.update({ ...newData })

    // If account
    if (newData.name == settings.getValue(WRSettings.account)) {
      accountChangeAlerts({ newData, oldData })
    }
  }
}

export const players = new Players('players', headers)
