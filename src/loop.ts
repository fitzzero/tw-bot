import { queryVillage } from './tw'
import { logger } from './utility/logger'

export const startLoop = async () => {
  logger({ prefix: 'success', message: 'Loop: Started' })
  console.log(await queryVillage(55))
}
