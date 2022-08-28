import { chromium, Page } from 'playwright'

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
    const element = page.locator(clipElement)
    const box = await element.boundingBox()
    if (box) clip = box
  }
  let data: DataStructure = {}
  if (dataRequest) {
    for (const request of dataRequest) {
      const innerText = await page.locator(request.locator).innerText()
      data[request.id] = innerText
    }
  }
  await page.screenshot({
    path,
    clip,
  })
  await browser.close()
  return { path, data }
}
