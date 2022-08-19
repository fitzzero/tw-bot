import { AttachmentBuilder, EmbedBuilder, MessageOptions } from 'discord.js'
import { isEmpty } from 'lodash'
import { isDev } from '../../config'
import { players } from '../../sheet/players'
import { TribeData } from '../../sheet/tribes'
import { getTribeUrl } from '../../tw/tribe'
import { worldPath } from '../../tw/world'
import { nFormatter } from '../../utility/numbers'
import { saveScreenshot } from '../../utility/screenshot'
import { WRColors } from '../colors'
import { MessageProps } from './message'
import { getPlayerMd } from './player'

interface TribeMessageProps extends MessageProps {
  tribe: TribeData
}

export const tribeMessage = async ({
  tribe,
  color = WRColors.purple,
  components = [],
  description = '',
}: TribeMessageProps) => {
  // Tribe Data
  const url = getTribeUrl(tribe.id)
  const tribePoints = nFormatter(parseInt(tribe.points))
  description += `Rank **${tribe.rank}** | **${tribePoints}** pts | **${tribe.villages}** villages`

  // Tribe Thumbnail
  const filePath = await saveScreenshot({
    id: 'tribe',
    url: `${worldPath(isDev ? 'c1' : undefined)}guest.php?screen=info_ally&id=${
      tribe.id
    }`,
    width: 1000,
    height: 500,
    clip: { x: 593, y: 108, width: 200, height: 200 },
  })

  // Tribe Members
  const members = players
    .filterByProperties([{ prop: 'tribe', value: tribe.id }])
    ?.sort((a, b) => {
      const pointsA = parseInt(a.points)
      const pointsB = parseInt(b.points)
      return pointsB - pointsA
    })

  if (members) {
    description += `\nMembers (${members.length}):\n`
  }

  members?.forEach(player => {
    const playerMd = getPlayerMd({ player, includeTribe: false })
    description += `\ **${player.rank}.** ${playerMd}\n`
  })

  // Message Object
  const file = new AttachmentBuilder(filePath)
  const embed = new EmbedBuilder()
    .setTitle(`${tribe.name} [${tribe.tag}]`)
    .setURL(url)
    .setThumbnail(`attachment://tribe.png`)
    .setDescription(description)
    .setColor(color)

  const options: MessageOptions = {
    embeds: [embed],
    files: [file],
  }

  // Message Buttons
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
