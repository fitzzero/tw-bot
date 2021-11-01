import { connection } from 'mongoose'
import { VoidFn } from '../types/methods'
import { logger } from '../utility/logger'

export const villageMigration: VoidFn = async () => {
  const villages = await connection.collection('villages')
  await villages.updateMany({}, { $unset: { player: '' } })
  logger({ prefix: 'success', message: 'Database: Migrated villages' })
  return
}
