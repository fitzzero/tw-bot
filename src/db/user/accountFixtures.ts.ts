import moment from 'moment'
import { PromiseFn } from '../../types/methods'
import { Scopes, AccountData } from '../../types/account'
import { logSuccess } from '../../utility/logger'
import { createAccount } from './accountController.ts'

const admins: AccountData[] = [
  {
    _id: '189812123348631563',
    handle: 'Logan',
    scopes: [Scopes.ADMIN],
    lastSync: moment(),
  },
]

export const accountFixtures: PromiseFn<void, void> = async () => {
  await Promise.all(
    admins.map(async accountData => {
      await createAccount(accountData)
    })
  )
  logSuccess('User Fixtures', 'Database')
}
