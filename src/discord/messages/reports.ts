import { AttachmentBuilder, MessageOptions } from 'discord.js'
import { isEmpty, take } from 'lodash'
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

export const reportsMessage = async ({
  color = WRColors.purple,
  content = '',
  components = [],
  description = '',
  footer,
  image,
  reports,
  timestamp,
  files = [],
  idx = 0,
}: ReportMessageProps) => {
  // Meta data
  const currentEmoji = await getDiscordEmoji(WREmojis.left)
  reports = reports.sort((a, b) => {
    const aTime = validateMoment(a.lastUpdate)?.unix()
    const bTime = validateMoment(b.lastUpdate)?.unix()
    if (!aTime || !bTime) {
      return 0
    }
    return bTime - aTime
  })

  reports = take(reports, 15)

  reports.forEach((report, reportIdx) => {
    const village = villages.getById(report.villageId)
    description += '\n'
    description += `[${village?.name}](<${report.url}>) `
    description += `<t:${getUnix(report.lastUpdate)}:R>`
    if (idx === reportIdx) description += ` ${currentEmoji} `
  })

  const currentReport = reports[idx]
  image = `attachment://${currentReport.id}.png`
  const attachment = new AttachmentBuilder(currentReport.path)
  files = [attachment]

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
