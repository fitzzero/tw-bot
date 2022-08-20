import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js'
import { villages } from '../../sheet/villages'
import { splitCoords } from '../../tw/village'
import { logAlert } from '../../utility/logger'
import { wait } from '../../utility/wait'

export const closeCommand = async (
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | ModalSubmitInteraction,
  message = 'Something went wrong, closing command...'
) => {
  try {
    await interaction.editReply(message)
    await wait(7000)
    await interaction.deleteReply()
  } catch (err) {
    logAlert(err, 'Discord: Canned Close Command')
  }
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
