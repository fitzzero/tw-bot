import { connection } from 'mongoose'
import { PromiseFn } from '../types/methods'
import { logger } from '../utility/logger'

export const villageMigration: PromiseFn<void, void> = async () => {
  const villages = await connection.collection('villages')
  await villages.updateMany({}, { $unset: { player: '' } })
  logger({ prefix: 'success', message: 'Database: Migrated villages' })
  return
}
