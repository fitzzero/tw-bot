import { chromium, Page } from 'playwright'

const basePath = `img/`

export interface SaveScreenshotProps {
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  height: number
  id: string
  pageFn?: (page: Page) => Promise<void>
  url: string
  width: number
}
export const saveScreenshot = async ({
  clip,
  height,
  id,
  pageFn,
  url,
  width,
}: SaveScreenshotProps) => {
  const path = `${basePath}${id}.png`
  let browser = await chromium.launch()

  let page = await browser.newPage()
  await page.setViewportSize({ width, height })
  await page.goto(url)
  if (pageFn) await pageFn(page)
  await page.screenshot({
    path,
    clip,
  })
  await browser.close()
  return path
}
