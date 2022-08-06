import { APIEmbedField } from 'discord-api-types'
import { MessageOptions } from 'discord.js'
import { storagePath } from '../../config'
import { WRColors } from '../colors'

interface stonksMessageProps {
  title: string
  url?: string
  fields: APIEmbedField[]
  positive: boolean
}

export const stonksMessage = ({
  title,
  url,
  fields,
  positive,
}: stonksMessageProps) => {
  const options: MessageOptions = {
    content: '',
    tts: false,
    embeds: [
      {
        title,
        description: '',
        color: positive ? WRColors.success : WRColors.error,
        fields: fields,
        thumbnail: {
          url: `${storagePath}stonks${positive ? 'up' : 'down'}.png`,
          height: 0,
          width: 0,
        },
        url,
      },
    ],
  }
  return options
}
