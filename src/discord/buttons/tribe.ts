import { ButtonInteraction, MessageOptions } from 'discord.js'
import { tribes } from '../../sheet/tribes'
import { Button } from '../buttons'
import { TribeDefaultButtons } from '../messages/tribe'

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

  await interaction.editReply(options)
}

export const tribeTrack: Button = {
  customId: 'tribe-track-',
  controller: handleTribeTrack,
}
