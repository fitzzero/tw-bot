import { APIEmbedField } from 'discord-api-types'
import { MessageOptions } from 'discord.js'

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
        color: positive ? 0x5efd4c : 0xeb3d3d,
        fields: fields,
        thumbnail: {
          url: `https://fitzzero.sirv.com/tribalwars/tw-bot/stonks${
            positive ? 'up' : 'down'
          }.png`,
          height: 0,
          width: 0,
        },
        url,
      },
    ],
  }
  return options
}
