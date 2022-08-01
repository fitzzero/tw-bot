import { GoogleSpreadsheet } from 'google-spreadsheet'
import { RateLimiter } from 'limiter'
import { botConfig } from '../config'
import { logger } from '../utility/logger'

export const doc = new GoogleSpreadsheet(botConfig.coreDoc)

export const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 1000 })

const auth = {
  client_email: process.env.WRGMAIL || '',
  private_key: process.env.WRGKEY?.replace(/\\n/g, '\n') || '',
}

export const loadDoc = async () => {
  await doc.useServiceAccountAuth(auth)
  await doc.loadInfo()

  logger({
    prefix: 'success',
    message: `Sheet: Connected to ${doc.title}`,
  })
  return doc
}
