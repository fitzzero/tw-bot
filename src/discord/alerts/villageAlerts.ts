import { channels, WRChannels } from '../../sheet/channels'
import { BaseSheetModel } from '../../sheet/sheetData'
import { VillageData, villages } from '../../sheet/villages'
import { getActiveAccount } from '../../tw/tribalWars'
import { getHoursSince } from '../../utility/time'
import { WRColors } from '../colors'
import { villageMessage } from '../messages/village'

export const villageChangeAlerts = async (
  newData: VillageData,
  oldData: VillageData & BaseSheetModel
) => {
  let activeAccount = getActiveAccount()
  let description: string | undefined = undefined
  let color: WRColors | undefined = undefined
  const belongsToAccount = newData.playerId === activeAccount?.id
  // Point alerts
  const oldPoints = parseInt(oldData.points)
  const newPoints = parseInt(newData.points)
  if (!oldPoints || !newPoints) return
  const pointDif = newPoints - oldPoints
  if (newPoints > 2000 && pointDif > 510 && !belongsToAccount) {
    description = `Has increased **${pointDif}** points, could be Academy`
    color = WRColors.warning
  }
  if (pointDif < 0) {
    description = `Has dropped **${pointDif}** points (~~${oldPoints}~~->${newPoints})`
    color = WRColors.gray
  }

  const hoursSince = getHoursSince(oldData.lastUpdate)
  if (
    newData.playerId != '0' &&
    !villages.hasChanges(newData) &&
    hoursSince &&
    hoursSince == 48 &&
    newPoints < 8000
  ) {
    description = `Inactive for 48 hours`
    color = WRColors.gray
  }

  if (description) {
    const message = villageMessage({ village: newData, description, color })
    await channels.sendMessage(WRChannels.news, message)
  }
  return
}
