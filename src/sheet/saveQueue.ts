import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { isEmpty } from 'lodash'
import { logger } from '../utility/logger'

const rowSaveQueue: GoogleSpreadsheetRow[] = []

export const queueRowSave = (row: GoogleSpreadsheetRow) => {
  const idx = rowSaveQueue.findIndex(savedRow => savedRow.id == row.id)
  if (idx > -1) {
    rowSaveQueue[idx] == row
  } else {
    rowSaveQueue.push(row)
  }
}

export const runSaveQueue = async () => {
  if (isEmpty(rowSaveQueue)) return
  logger({
    prefix: 'start',
    message: `Sheet: ${rowSaveQueue.length} rows in queue to save`,
  })
  let idx = 0
  let interval = setInterval(function () {
    ++idx
    const row = rowSaveQueue.shift()
    row?.save()
    if (idx > 59 || isEmpty(rowSaveQueue)) {
      clearInterval(interval)
      logger({
        prefix: 'success',
        message: `Sheet: Update queue saved`,
      })
    }
  }, 1000)
  return
}
