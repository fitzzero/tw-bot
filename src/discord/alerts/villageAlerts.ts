import { channels, WRChannels } from '../../sheet/channels'
import { BaseSheetModel } from '../../sheet/sheetData'
import { VillageData, villages } from '../../sheet/villages'
import { getHoursSince } from '../../utility/time'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

export const villageChangeAlerts = async (
  newData: VillageData,
  oldData: VillageData & BaseSheetModel
) => {
  let content: string | undefined = undefined
  let color: WRColors | undefined = undefined
  // Point alerts
  const oldPoints = parseInt(oldData.points)
  const newPoints = parseInt(newData.points)
  if (!oldPoints || !newPoints) return
  const pointDif = newPoints - oldPoints
  if (newPoints > 2000 && pointDif > 510) {
    content = `Has increased **${pointDif}** points, could be Academy`
  }
  if (pointDif < 0) {
    content = `Has dropped **${pointDif}** points (~~${oldPoints}~~->${newPoints})`
    color = WRColors.error
  }

  const hoursSince = getHoursSince(oldData.lastUpdate)
  if (
    newData.playerId != '0' &&
    villages.hasChanges(newData) &&
    hoursSince &&
    hoursSince == 48
  ) {
    content = `Inactive for 48 hours`
    color = WRColors.error
  }

  if (content) {
    const message = villageMessage({ village: newData, content, color })
    await channels.sendMessage(WRChannels.news, message)
  }
  return
}
