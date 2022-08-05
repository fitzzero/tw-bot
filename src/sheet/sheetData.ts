import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import { keys } from 'ts-transformer-keys'
import { logAlert, logger } from '../utility/logger'
import { nowString } from '../utility/time'
import { doc, limiter } from './connect'

export interface BaseSheetModel {
  lastUpdate: string
}

const addedHeaders = keys<BaseSheetModel>()

export interface RowStructure {
  [propName: string]: string
}

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
      this.rows = await this.sheet.getRows()
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
    const found = this.rows?.find(row => row.id === id)
    if (!found) return
    const foundObj: any = {}
    this.headers.forEach(header => {
      foundObj[header] = found[header]
    })
    return foundObj as data & BaseSheetModel
  }

  /*
   * Get row by id
   */
  getByProperty = (property: string, value: string) => {
    const found = this.rows?.find(row => row[property] === value)
    if (!found) return
    const foundObj: any = {}
    this.headers.forEach(header => {
      foundObj[header] = found[header]
    })
    return foundObj as data & BaseSheetModel
  }

  /*
   * See if data changed
   */
  hasChanges = (values: data, idx = -1) => {
    let changes = false
    if (idx === -1) idx = this.rows.findIndex(row => row.id === values.id)
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
    return changes
  }

  /*
   * Filter by Properties
   */
  filterByProperties = (searchPair: { prop: string; value: string }[]) => {
    const found = this.rows
      ?.filter(row => {
        let isMatch = true
        // If all props don't match value, match is false
        searchPair.forEach(pair => {
          if (row[pair.prop] != pair.value) isMatch = false
        })
        return isMatch
      })
      ?.map(match => {
        const foundObj: any = {}
        this.headers.forEach(header => {
          foundObj[header] = match[header]
        })
        return foundObj as data & BaseSheetModel
      })
    if (found.length == 0) return
    else return found
  }

  /*
   * Add new row
   */
  removeById = async (id: string) => {
    const found = this.rows?.find(row => row.id == id)
    if (!found) return
    await limiter.removeTokens(1)
    try {
      await found.delete()
      this.rows = await this.sheet.getRows()
      return true
    } catch (err) {
      logAlert(err, 'Sheet Remove')
      return false
    }
  }

  /*
   * Update existing
   */
  update = async (values: data, changes = false) => {
    const idx = this.rows.findIndex(row => row.id == values.id)
    if (idx === -1) return false

    if (this.hasChanges(values)) changes = true

    if (changes) {
      try {
        await limiter.removeTokens(1)
        this.rows[idx].lastUpdate = nowString()
        // @ts-ignore
        await this.rows[idx].save({ raw: true })
        return true
      } catch (err) {
        logAlert(err, 'Sheets update')
        return false
      }
    } else {
      return true
    }
  }

  /*
   * Update row
   * Or add if new
   */
  updateOrAdd = async (values: data, changes = false) => {
    const updateExisting = await this.update(values, changes)
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
   * Reload rows
   */
  loadRows = async () => {
    try {
      this.rows = await this.sheet.getRows()
    } catch (err) {
      logAlert(err, 'Sheet loadRows')
    }
  }

  /*
   * Load the class sheet
   * Create a new sheet if not found
   */
  private getOrCreateSheet = async () => {
    if (!doc) return
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
