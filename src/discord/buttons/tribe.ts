import { ButtonInteraction, MessageOptions } from 'discord.js'
import { tribes } from '../../sheet/tribes'
import { StatOdTypes } from '../../tw/statsScreenshot'
import { logAlert } from '../../utility/logger'
import { Button } from '../buttons'
import { TribeDefaultButtons, tribeMessage } from '../messages/tribe'

const getTribeFromId = (customId: string) => {
  const tribeId = customId.split('-')[2]
  if (!tribeId) return
  return tribes.getById(tribeId)
}

const handleTribeTrack = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
  const tribe = getTribeFromId(interaction.customId)
  if (!tribe) {
    interaction.deleteReply()
    return
  }
  // Toggle
  if (tribe.tracking != 'TRUE') {
    tribe.tracking = 'TRUE'
  } else {
    tribe.tracking = 'FALSE'
  }
  await tribes.update(tribe)

  const options: MessageOptions = {
    components: [
      {
        type: 1,
        components: await TribeDefaultButtons(tribe),
      },
    ],
  }
  try {
    await interaction.editReply(options)
  } catch (err) {
    logAlert(err, 'Discord: /tribe interaction update')
  }
}

const handleTribeImage = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
  const tribe = getTribeFromId(interaction.customId)
  if (!tribe) {
    interaction.deleteReply()
    return
  }
  const od = interaction.customId.split('-')[3] as StatOdTypes

  const payload = await tribeMessage({ tribe, od })

  try {
    await interaction.editReply(payload)
  } catch (err) {
    logAlert(err, 'Discord: /tribe interaction update')
  }
}

export const tribeTrack: Button = {
  customId: 'tribe-track-',
  controller: handleTribeTrack,
}

export const tribeImage: Button = {
  customId: 'tribe-image-',
  controller: handleTribeImage,
}
