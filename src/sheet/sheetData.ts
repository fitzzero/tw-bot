import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import { logger } from '../utility/logger'
import { nowString } from '../utility/time'
import { doc, limiter } from './connect'
import { queueRowSave } from './saveQueue'

interface idData {
  id: string
  lastEdit: string
}

type dataParser = (str: string) => any

enum PARSABLE_TYPE {
  NUMBER,
  STRING,
  BOOLEAN,
}

const typeParserMap = new Map<PARSABLE_TYPE, dataParser>()

typeParserMap.set(PARSABLE_TYPE.NUMBER, (str: string) => parseInt(str))
typeParserMap.set(PARSABLE_TYPE.STRING, (str: string) => str)
typeParserMap.set(PARSABLE_TYPE.BOOLEAN, (str: string) => {
  return str == 'true' || str == 'TRUE' || str == '1'
})

type headerTypeMap = Map<string, PARSABLE_TYPE>

interface ConstructorProps {
  title: string
  headerTypeMap: headerTypeMap
}

export class SheetData<data extends idData> {
  title: string
  headerTypeMap: headerTypeMap

  private sheet: GoogleSpreadsheetWorksheet
  private rows?: GoogleSpreadsheetRow[]

  constructor({ title, headerTypeMap }: ConstructorProps) {
    this.title = title
    this.headerTypeMap = headerTypeMap
  }

  /*
   * Add new row
   */
  add = async (values: data) => {
    await limiter.removeTokens(1)
    await this.sheet.addRow(values)
  }

  /*
   * Get row by id
   */
  getById = (id: string) => {
    const found = this.rows?.find(row => row.id == id)
    return found
  }

  /*
   * Update row
   * Or add if new
   */
  updateOrAdd = async (values: data, changes = false) => {
    const idx = this.rows?.findIndex(row => row.id === values.id)
    if (idx) {
      this.headers.forEach(header => {
        if (values[header] && this.rows[idx][header] != values[header]) {
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
    return this.rows[idx]
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
