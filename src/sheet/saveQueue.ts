import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { isEmpty } from 'lodash'
import { logger } from '../utility/logger'
import { limiter } from './connect'

const rowSaveQueue: GoogleSpreadsheetRow[] = []
let queueInProgress = false

export const queueRowSave = (row: GoogleSpreadsheetRow) => {
  const idx = rowSaveQueue.findIndex(savedRow => savedRow.id == row.id)
  if (idx > -1) {
    rowSaveQueue[idx] == row
  } else {
    rowSaveQueue.push(row)
  }
  if (!queueInProgress) runSaveQueue()
}

export const runSaveQueue = async () => {
  queueInProgress = true
  logger({
    prefix: 'start',
    message: `Sheet: ${rowSaveQueue.length} rows in queue to save`,
  })
  while (!isEmpty(rowSaveQueue)) {
    await limiter.removeTokens(1)
    const row = rowSaveQueue.shift()
    row?.save()
  }
  queueInProgress = false
  logger({
    prefix: 'success',
    message: `Sheet: Update queue completed`,
  })
  return
}
