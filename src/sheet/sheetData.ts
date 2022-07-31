import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'
import { logger } from '../utility/logger'
import { nowString } from '../utility/time'
import { doc } from './connect'

interface ConstructorProps {
  title: string
  headers: string[]
}

export interface BaseSheetModel {
  lastSync: string
}

interface IdData {
  id: string
  [propName: string]: string | number | boolean
}

export class SheetData {
  title: string
  headers: string[]
  private sheet: GoogleSpreadsheetWorksheet
  private rows: GoogleSpreadsheetRow[]

  constructor({ title, headers }: ConstructorProps) {
    this.title = title
    this.headers = headers
  }

  /*
   * Add new row
   */
  add = async (values: IdData) => {
    const data: IdData = {
      ...values,
      lastSync: nowString(),
    }
    await this.sheet.addRow(data)
  }

  /*
   * Get row by id
   */
  getById = (id: string) => {
    const found = this.rows.find(row => row.id == id)
    return found
  }

  /*
   * Update row
   * Or add if new
   */
  updateOrAdd = async (values: IdData) => {
    const row = this.getById(values.id)
    if (row) {
      this.headers.forEach(header => {
        if (values[header]) {
          row[header] = values[header]
        }
      })
      row.lastSync = nowString()
      await row.save()
    } else {
      this.add(values)
    }
    return row
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

// export const useLocalStorage = <T>(key: string, initialValue: T) => {
//   const [internal, setInternal] = useLocalStorageValue({
//     key: key,
//     defaultValue: JSON.stringify(initialValue || '')
//   })

//   const value = useMemo(() => JSON.parse(internal) as T, [internal])

//   const setValue = useCallback(
//     (value: T | ((val: T) => T)) => {
//       const updated = isFunction(value) ? value(JSON.parse(internal)) : value
//       setInternal(JSON.stringify(updated))
//     },
//     [internal, setInternal]
//   )

//   return [value, setValue] as const
// }
