import { saveScreenshot } from '../utility/screenshot'

interface StatsImageProps {
  fileId: string
  entityId: string
  world: string
  type: 'tribe' | 'player'
  od?: 'oda' | 'odd'
}

export const statsImage = async ({
  fileId,
  entityId,
  world,
  type,
  od,
}: StatsImageProps) => {
  if (!od) {
    return await saveScreenshot({
      id: fileId,
      url: `http://us${world}.tribalwarsmap.com/us/graph/${type}/${entityId}`,
      width: 561,
      height: 319,
    })
  }
  return await saveScreenshot({
    id: fileId,
    url: `http://us${world}.tribalwarsmap.com/us/graph/${od}_${type}/${entityId}`,
    width: 318,
    height: 133,
  })
}
