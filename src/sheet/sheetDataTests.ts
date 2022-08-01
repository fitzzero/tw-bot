import { BaseSheetModel, SheetData } from './sheetData'
import { keys } from 'ts-transformer-keys'

interface BaseTestData {
  id: string
  name: string
  points: number
}

interface TestData extends BaseTestData, BaseSheetModel {}

const headers = keys<BaseTestData>()

export const testData = new SheetData<TestData>({
  title: 'testData',
  headers,
})

export const runSheetDataTests = async () => {
  await testData.loadData()

  await testData.updateOrAdd({
    id: 'test1',
    name: 'Two',
    points: 5,
    lastUpdate: '',
  })

  const test1 = testData.getById('test1')
  if (test1?.name != 'Two') return false
  await testData.updateOrAdd({
    id: 'test1',
    name: 'Three',
    points: 5,
    lastUpdate: '',
  })

  return true
}
