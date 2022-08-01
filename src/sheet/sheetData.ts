import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import { keys } from 'ts-transformer-keys'
import { logger } from '../utility/logger'
import { nowString } from '../utility/time'
import { doc, limiter } from './connect'
import { queueRowSave } from './saveQueue'

interface AddedProps {
  lastUpdate: string
}

export interface BaseSheetModel extends AddedProps {
  [propName: string]: RowData
}

export type RowData = string | number | boolean

const addedHeaders = keys<AddedProps>()

interface ConstructorProps {
  title: string
  headers: string[]
}

export class SheetData<data extends BaseSheetModel> {
  title: string
  headers: string[]

  private sheet: GoogleSpreadsheetWorksheet
  private rows: GoogleSpreadsheetRow[]

  constructor({ title, headers }: ConstructorProps) {
    this.title = title
    this.headers = headers

    addedHeaders.forEach(header => {
      this.headers.push(header)
    })
  }

  /*
   * Add new row
   */
  add = async (values: data) => {
    await limiter.removeTokens(1)
    values.lastUpdate = nowString()
    await this.sheet.addRow(values)
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
    return foundObj as data
  }

  /*
   * Update row
   * Or add if new
   */
  updateOrAdd = async (values: data, changes = false) => {
    const idx = this.rows.findIndex(row => row.id === values.id)
    if (this.rows[idx]) {
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
      }
    } else {
      await this.add(values)
    }
    return
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
