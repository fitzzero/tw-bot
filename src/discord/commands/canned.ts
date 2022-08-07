import { ChatInputCommandInteraction } from 'discord.js'
import { villages } from '../../sheet/villages'
import { splitCoords } from '../../tw/village'
import { wait } from '../../utility/wait'

export const closeCommand = async (
  interaction: ChatInputCommandInteraction,
  message = 'Something went wrong, closing command...'
) => {
  await interaction.editReply(message)
  await wait(7000)
  await interaction.deleteReply()
}

export const parseInteractionCoordinates = async (
  interaction: ChatInputCommandInteraction,
  optionLabel = 'coordinates',
  required = true
) => {
  const coords = interaction.options.getString(optionLabel)
  if (!coords && !required) {
    return
  }
  if (!coords) {
    closeCommand(interaction, 'Coordinates missing')
    return
  }
  const coordsSplit = splitCoords(coords)
  if (!coordsSplit) {
    closeCommand(interaction, 'Issue parsing coordinates, closing command')
    return
  }

  const village = villages.getByCoords(coordsSplit)
  if (!village) {
    closeCommand(interaction, 'Village not found')
    return
  }

  return village
}
