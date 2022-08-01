import { keys } from 'ts-transformer-keys'
import { BaseSheetModel, SheetData } from './sheetData'

interface TestData extends BaseSheetModel {
  id: string
  name: string
  points: number
}

const headers = keys<TestData>().map(key => key.toString())

export const testData = new SheetData<TestData>('testData', headers)

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
    name: 'One',
    points: 5,
    lastUpdate: '',
  })

  return true
}
