import { GoogleSpreadsheetRow } from 'google-spreadsheet'
import { isEmpty } from 'lodash'
import { botConfig } from '../config'
import { logAlert, logger } from '../utility/logger'
import { limiter } from './connect'

const rowSaveQueue: GoogleSpreadsheetRow[] = []
let queueInProgress = false

export const getQueueLength = () => {
  return rowSaveQueue.length
}

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
  while (!isEmpty(rowSaveQueue)) {
    await limiter.removeTokens(1)
    const row = rowSaveQueue.shift()
    if (!row) break
    try {
      if (botConfig.writeEnabled) {
        // https://theoephraim.github.io/node-google-spreadsheet/#/classes/google-spreadsheet-row?id=fn-save
        // @ts-ignore
        await row.save({ raw: true })
      } else {
        logger({ prefix: 'start', message: `${row.id} updated` })
      }
    } catch (err: any) {
      logAlert(err, 'Sheet Queue')
      // Attempt to re-save unless deleted
      if (!err.message.includes('This row has been deleted')) {
        queueRowSave(row)
      }
    }
  }
  queueInProgress = false
  logger({
    prefix: 'success',
    message: `Sheet: Update queue completed`,
  })
  return
}
