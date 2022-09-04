import { AttachmentBuilder } from 'discord.js'

export interface MessageProps {
  color?: WRColors
  content?: string
  components?: APIButtonComponentWithCustomId[]
  description?: string
  footer?: string
  timestamp?: string
  image?: string
  files?: AttachmentBuilder[]
}
