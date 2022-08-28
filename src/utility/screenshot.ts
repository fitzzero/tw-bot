import { chromium, Page } from 'playwright'
import { logAlert } from './logger'

const basePath = `img/`

export interface DataStructure {
  [propName: string]: string
}

export interface DataRequest {
  id: string
  locator: string
}

export interface SaveScreenshotProps {
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  clipElement?: string
  dataRequest?: DataRequest[]
  height: number
  id: string
  pageFn?: (page: Page) => Promise<void>
  url: string
  width: number
}
export const saveScreenshot = async ({
  clip,
  clipElement,
  dataRequest,
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
    try {
      const element = page.locator(clipElement)
      const box = await element.boundingBox()
      if (box) clip = box
    } catch (err) {
      logAlert(err)
    }
  }
  let data: DataStructure = {}
  await page.screenshot({
    path,
    clip,
  })
  if (dataRequest) {
    page.setDefaultTimeout(100)
    for (const request of dataRequest) {
      try {
        const innerText = await page.locator(request.locator).innerText()
        data[request.id] = innerText
      } catch (err) {
        logAlert(err)
      }
    }
  }
  await browser.close()
  return { path, data }
}
