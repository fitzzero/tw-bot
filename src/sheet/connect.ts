import { GoogleSpreadsheet } from 'google-spreadsheet'
import { logger } from '../utility/logger'

export const doc = new GoogleSpreadsheet(
  '11q2LsofJBmaP_PKJt8W5eHhY2MwT3hvylNvlvzPQgQI'
)

export const loadDoc = async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.WRGMAIL || '',
    private_key: process.env.WRGKEY?.replace(/\\n/g, '\n') || '',
  })

  await doc.loadInfo()

  logger({
    prefix: 'success',
    message: `Sheet: Connected to ${doc.title}`,
  })
}
