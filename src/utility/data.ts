export const parseCsv = (text: string): any => {
  const lines = text.split('\n')
  const data = lines.map(function (lin) {
    return lin.split(',')
  })
  return data
}
