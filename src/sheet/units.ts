import { keys } from 'ts-transformer-keys'
import { getActiveGuild } from '../discord/guild'
import { RowStructure, SheetData } from './sheetData'

export interface UnitData extends RowStructure {
  id: string
  img: string
  basetime: string
  speed: string
  pop: string
  emoji: string
}

const headers = keys<UnitData>().map(key => key.toString())

class Units extends SheetData<UnitData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  getDiscordEmoji = async (id: string) => {
    const guild = await getActiveGuild()
    const unit = this.getById(id)
    if (!unit) return
    const emojiName = unit.emoji.replaceAll(':', '')
    return guild.emojis.cache.find(emoji => emoji.name == emojiName)
  }
}

export const units = new Units('units', headers)
