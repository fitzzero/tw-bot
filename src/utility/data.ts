export const parseCsv = (text: string, split = '\n'): any => {
  const lines = text.split(split)
  const data = lines.map(function (lin) {
    return lin.split(',')
  })
  return data
}
