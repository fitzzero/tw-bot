import { chromium } from 'playwright'

const basePath = `img/`

export interface SaveScreenshotProps {
  id: string
  url: string
  width: number
  height: number
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
}
export const saveScreenshot = async ({
  id,
  url,
  width,
  height,
  clip,
}: SaveScreenshotProps) => {
  const path = `${basePath}${id}.png`
  let browser = await chromium.launch()

  let page = await browser.newPage()
  await page.setViewportSize({ width, height })
  await page.goto(url)
  await page.screenshot({
    path,
    clip,
  })
  await browser.close()
  return path
}
