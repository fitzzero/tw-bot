import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js'
import { players } from '../../sheet/players'
import { tribes } from '../../sheet/tribes'
import { villages } from '../../sheet/villages'
import { splitCoords } from '../../tw/village'
import { logAlert } from '../../utility/logger'
import { wait } from '../../utility/wait'

export interface ParseCommandProps {
  interaction: ChatInputCommandInteraction
  optionLabel?: string
  required?: boolean
}

export type SupportedInteractions =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | ModalSubmitInteraction

export const closeCommand = async (
  interaction: SupportedInteractions,
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

export const parseInteractionCoordinates = async ({
  interaction,
  optionLabel = 'coordinates',
  required = true,
}: ParseCommandProps) => {
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

export const parseInteractionPlayer = async ({
  interaction,
  optionLabel = 'player',
  required = true,
}: ParseCommandProps) => {
  const playerName = interaction.options.getString(optionLabel)
  if (!playerName && !required) {
    return
  }
  if (!playerName) {
    closeCommand(interaction, 'Player name missing')
    return
  }
  const player = players.getByProperty('name', playerName)
  if (!player) {
    closeCommand(interaction, 'Player not found')
    return
  }

  return player
}

export const parseInteractionTribe = async ({
  interaction,
  optionLabel = 'tribe',
  required = true,
}: ParseCommandProps) => {
  const tribeTag = interaction.options.getString(optionLabel)
  if (!tribeTag && !required) {
    return
  }
  if (!tribeTag) {
    closeCommand(interaction, 'Tribe tag missing')
    return
  }
  const tribe = tribes.getByProperty('tag', tribeTag)
  if (!tribe) {
    closeCommand(interaction, 'Tribe tag not found')
    return
  }

  return tribe
}
