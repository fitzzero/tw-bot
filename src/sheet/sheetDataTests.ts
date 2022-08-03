import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

interface TestData extends RowStructure {
  id: string
  name: string
  points: string
}

const headers = keys<TestData>().map(key => key.toString())

export const testData = new SheetData<TestData>('testData', headers)

export const runSheetDataTests = async () => {
  await testData.loadData()

  await testData.updateOrAdd({
    id: 'test1',
    name: 'Two',
    points: '5',
  })

  const test1 = testData.getById('test1')
  if (test1?.name != 'Two') return false

  await testData.updateOrAdd({
    id: 'test2',
    name: 'Three',
    points: '5',
  })

  const test2 = testData.getByProperty('name', 'Three')
  if (test2?.name != 'Three') return false

  await testData.updateOrAdd({
    id: 'test1',
    name: 'One',
    points: '5',
  })
  return true
}
