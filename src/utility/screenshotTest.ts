import { saveScreenshot } from './screenshot'

export const screenshotTests = async () => {
  await saveScreenshot({
    id: 'test',
    url: 'https://usc1.tribalwars.us/guest.php?screen=ranking&mode=player',
    width: 980,
    height: 564,
    clip: { x: 249, y: 284, width: 620, height: 280 },
  })
  return false
}
