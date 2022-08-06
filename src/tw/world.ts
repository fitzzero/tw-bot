import { settings, WRSettings } from '../sheet/settings'

export const worldPath = (world?: string) => {
  if (!world) world = settings.getValue(WRSettings.world)
  return `https://us${world}.tribalwars.us/`
}
