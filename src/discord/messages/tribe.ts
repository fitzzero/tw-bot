import {
  APIButtonComponentWithCustomId,
  AttachmentBuilder,
  EmbedBuilder,
  MessageOptions,
} from 'discord.js'
import { isEmpty } from 'lodash'
import { isDev } from '../../config'
import { players } from '../../sheet/players'
import { settings, WRSettings } from '../../sheet/settings'
import { TribeData } from '../../sheet/tribes'
import { StatOdTypes, statsImage } from '../../tw/statsScreenshot'
import { getTribeUrl } from '../../tw/tribe'
import { worldPath } from '../../tw/world'
import { nFormatter } from '../../utility/numbers'
import { saveScreenshot } from '../../utility/screenshot'
import { WRColors } from '../colors'
import { eyeButton } from '../components/eye'
import { MessageProps } from './message'
import { getPlayerMd } from './player'

interface TribeMessageProps extends MessageProps {
  tribe: TribeData
  od?: StatOdTypes
}

export const tribeMessage = async ({
  tribe,
  color = WRColors.purple,
  components = [],
  description = '',
  od,
}: TribeMessageProps) => {
  // Tribe Data
  const world = isDev ? 'c1' : settings.getValue(WRSettings.world) || 'c1'
  const url = getTribeUrl(tribe.id)
  const tribePoints = nFormatter(parseInt(tribe.points))
  description += `Rank **${tribe.rank}** | **${tribePoints}** pts | **${tribe.villages}** villages`

  // Tribe Thumbnail
  const tribeThumb = await saveScreenshot({
    id: 'tribeThumb',
    url: `${worldPath(world)}guest.php?screen=info_ally&id=${tribe.id}`,
    width: 1000,
    height: 500,
    clip: { x: 593, y: 108, width: 200, height: 200 },
  })

  // Tribe Graph
  const tribeImage = await statsImage({
    fileId: 'tribeImage',
    entityId: tribe.id,
    type: 'tribe',
    world,
    od,
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
  const thumbnail = new AttachmentBuilder(tribeThumb)
  const image = new AttachmentBuilder(tribeImage)
  const embed = new EmbedBuilder()
    .setTitle(`${tribe.name} [${tribe.tag}]`)
    .setURL(url)
    .setImage(`attachment://tribeImage.png`)
    .setThumbnail(`attachment://tribeThumb.png`)
    .setDescription(description)
    .setColor(color)

  if (isEmpty(components)) components = await TribeDefaultButtons(tribe)

  const options: MessageOptions = {
    embeds: [embed],
    files: [image, thumbnail],
    components: [
      {
        type: 1,
        components,
      },
    ],
  }

  return options
}

export const TribeDefaultButtons = async (
  tribe: TribeData,
  od?: StatOdTypes
) => {
  const components: APIButtonComponentWithCustomId[] = []
  components.push(
    await eyeButton({
      id: `tribe-track-${tribe.id}`,
      open: tribe.tracking != 'TRUE',
      openLabel: 'Watch',
      label: 'Stop',
    })
  )
  if (!!od) {
    components.push({
      custom_id: `tribe-image-${tribe.id}-`,
      label: 'Overview',
      style: 2,
      type: 2,
    })
  }
  if (od != StatOdTypes.oda) {
    components.push({
      custom_id: `tribe-image-${tribe.id}-${StatOdTypes.oda}`,
      label: 'ODA',
      style: 2,
      type: 2,
    })
  }
  if (od != StatOdTypes.odd) {
    components.push({
      custom_id: `tribe-image-${tribe.id}-${StatOdTypes.odd}`,
      label: 'ODA',
      style: 2,
      type: 2,
    })
  }

  return components
}
