import { GuildEmoji } from 'discord.js'
import { keys } from 'ts-transformer-keys'
import { getCoreGuild } from '../discord/guild'
import { logAlert } from '../utility/logger'
import { RowStructure, SheetData } from './sheetData'

export interface UnitData extends RowStructure {
  id: string
  img: string
  basetime: string
  speed: string
  pop: string
}

const headers = keys<UnitData>().map(key => key.toString())

class Units extends SheetData<UnitData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }
}

export const units = new Units('units', headers)
