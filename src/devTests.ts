import { runSheetDataTests } from './sheet/sheetDataTests'
import { logger } from './utility/logger'
import { screenshotTests } from './utility/screenshotTest'

export const runDevTests = async () => {
  var passed = true
  passed = await runSheetDataTests()
  passed = await screenshotTests()

  if (!passed) {
    logger({
      prefix: 'alert',
      message: `Dev: Tests Failed`,
    })
    return false
  }

  logger({
    prefix: 'success',
    message: `Dev: Tests Passed`,
  })
  return passed
}
