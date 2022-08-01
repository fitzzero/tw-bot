import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

export interface TestData extends BaseSheetModel {
  id: string
  name: string
  points: number
}

const headers = keys<TestData>()

export const testData = new SheetData({ title: 'testData', headers })

export const runSheetDataTests = async () => {
  await testData.loadData()

  await testData.updateOrAdd({
    id: 'test1',
    name: 'Two',
    points: 5,
  })

  const test1 = testData.getById('test1')
  if (test1?.name != 'Two') return false
  await testData.updateOrAdd({
    id: 'test1',
    name: 'One',
  })

  return true
}
