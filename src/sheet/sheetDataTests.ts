import { keys } from 'ts-transformer-keys'
import { RowStructure, SheetData } from './sheetData'

interface TestData extends RowStructure {
  id: string
  name: string
  points: string
  x: string
  y: string
}

const headers = keys<TestData>().map(key => key.toString())

export const testData = new SheetData<TestData>('testData', headers)

export const runSheetDataTests = async () => {
  await testData.loadData()

  await testData.updateOrAdd({
    id: 'test1',
    name: 'Two',
    points: '5',
    x: '4',
    y: '7',
  })

  const test1 = testData.getById('test1')
  if (test1?.name != 'Two') return false

  await testData.updateOrAdd({
    id: 'test2',
    name: 'Three',
    points: '5',
    x: '5',
    y: '8',
  })

  const test2 = testData.getByProperty('name', 'Three')
  if (test2?.name != 'Three') return false

  await testData.updateOrAdd({
    id: 'test1',
    name: '0001',
    points: '5',
    x: '4',
    y: '7',
  })

  const test3 = testData.filterByProperties([
    { prop: 'x', value: '23' },
    { prop: 'y', value: '9' },
  ])
  if (test3?.[0].name != 'blah') return false

  return true
}
