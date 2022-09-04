import { MessageOptions } from 'discord.js'
import { isEmpty } from 'lodash'
import { ReportData } from '../../sheet/reports'
import { villages } from '../../sheet/villages'
import { getUnix, validateMoment } from '../../utility/time'
import { WRColors } from '../colors'
import { getDiscordEmoji, WREmojis } from '../guild'
import { MessageProps } from './message'

export interface ReportMessageProps extends MessageProps {
  idx: number
  reports: ReportData[]
}

export const reportsMessage = ({
  color = WRColors.purple,
  content = '',
  components = [],
  description = '',
  footer,
  image,
  reports,
  timestamp,
  files = [],
  idx,
}: ReportMessageProps) => {
  // Meta data
  const currentEmoji = getDiscordEmoji(WREmojis.right)
  reports = reports.sort((a, b) => {
    const aTime = validateMoment(a.lastUpdate)?.unix()
    const bTime = validateMoment(b.lastUpdate)?.unix()
    if (!aTime || !bTime) {
      return 0
    }
    return aTime - bTime
  })

  reports.forEach((report, reportIdx) => {
    const village = villages.getById(report.villageId)
    description += '\n'
    if (idx === reportIdx) description += `${currentEmoji} `
    description += `[${village?.name}](<${report.url}>)`
    description += `<t:${getUnix(report.lastUpdate)}:R>`
  })

  const options: MessageOptions = {
    content,
    tts: false,
    embeds: [
      {
        title: `Reports`,
        description,
        color,
        image: image ? { url: image } : undefined,
        footer: footer
          ? {
              text: footer,
            }
          : undefined,
        timestamp,
      },
    ],
    files: files,
  }

  if (!isEmpty(components)) {
    options.components = [
      {
        type: 1,
        components,
      },
    ]
  }

  return options
}
