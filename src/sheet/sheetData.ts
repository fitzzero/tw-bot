import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import { keys } from 'ts-transformer-keys'
import { logAlert, logger } from '../utility/logger'
import { nowString } from '../utility/time'
import { doc, limiter } from './connect'
import { queueRowSave } from './saveQueue'

export interface BaseSheetModel {
  lastUpdate: string
}

const addedHeaders = keys<BaseSheetModel>()

export interface RowStructure {
  [propName: string]: RowData
}

type RowData = string | number | boolean

export class SheetData<data extends RowStructure> {
  title: string
  headers: string[]

  private sheet: GoogleSpreadsheetWorksheet
  private rows: GoogleSpreadsheetRow[]

  constructor(tabTitle: string, tabHeaders: string[]) {
    this.title = tabTitle
    this.headers = tabHeaders
    addedHeaders.forEach(header => {
      this.headers.push(header)
    })
  }

  /*
   * Add new row
   */
  add = async (values: data) => {
    await limiter.removeTokens(1)
    try {
      await this.sheet.addRow({ ...values, lastUpdate: nowString() })
      return true
    } catch (err) {
      logAlert(err, 'Sheet Add')
      return false
    }
  }

  /*
   * Get row by id
   */
  getById = (id: string) => {
    const found = this.rows?.find(row => row.id == id)
    if (!found) return
    const foundObj: any = {}
    this.headers.forEach(header => {
      foundObj[header] = found[header]
    })
    return foundObj as data & BaseSheetModel
  }

  /*
   * Update existing
   */
  update = (values: data, changes = false) => {
    const idx = this.rows.findIndex(row => row.id === values.id)
    if (idx === -1) return false

    this.headers.forEach(header => {
      if (
        header != 'lastUpdate' &&
        values[header] &&
        this.rows[idx][header] != values[header]
      ) {
        this.rows[idx][header] = values[header]
        changes = true
      }
    })
    if (changes) {
      this.rows[idx].lastUpdate = nowString()
      queueRowSave(this.rows[idx])
      return true
    } else {
      return true
    }
  }

  /*
   * Update row
   * Or add if new
   */
  updateOrAdd = async (values: data, changes = false) => {
    const updateExisting = this.update(values, changes)
    if (updateExisting) return true
    else return await this.add(values as data)
  }

  /*
   * Load saved data
   */
  loadData = async () => {
    await this.getOrCreateSheet()
    await this.syncSheetHeaders()
    this.rows = await this.sheet.getRows()

    logger({
      prefix: 'success',
      message: `Sheet: Loaded ${this.title}`,
    })
  }

  /*
   * Load the class sheet
   * Create a new sheet if not found
   */
  private getOrCreateSheet = async () => {
    const title = this.title
    let sheet = doc.sheetsByTitle[title]
    if (!sheet) {
      sheet = await doc.addSheet({ title })
    }
    this.sheet = sheet
  }

  /*
   * Sync the class Headers
   * Add any property types
   * Must manually delete old
   */
  private syncSheetHeaders = async () => {
    const savedHeaders = this.sheet.headerValues
    const newHeaders: string[] = []
    this.headers.forEach(header => {
      if (!savedHeaders?.includes(header)) {
        newHeaders.push(header)
      }
    })
    await this.sheet.setHeaderRow(newHeaders)
  }
}
