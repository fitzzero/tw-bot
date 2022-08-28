import { chromium, Page } from 'playwright'

const basePath = `img/`

export interface SaveScreenshotProps {
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  clipElement?: string
  height: number
  id: string
  pageFn?: (page: Page) => Promise<void>
  url: string
  width: number
}
export const saveScreenshot = async ({
  clip,
  clipElement,
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
  if (clipElement) {
    const element = await page.locator(clipElement)
    const box = await element.boundingBox()
    if (box) {
      clip = box
      console.log('element found')
      console.log(box)
    }
  }
  await page.screenshot({
    path,
    clip,
  })
  await browser.close()
  return { path }
}
