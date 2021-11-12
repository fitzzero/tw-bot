import { Fn, PromiseFn } from '../../@types/methods'
import { Account, AccountData, Scopes } from '../../@types/account'
import { logSuccess } from '../../utility/logger'
import { AccountModel } from './accountSchema'
import { accountFixtures } from './accountFixtures'

let activeAccounts: Account[] = []

export const getActiveAccounts: Fn<void, Account[]> = () => {
  return activeAccounts
}

export const loadActiveAccounts: PromiseFn<void, void> = async () => {
  const loadedAccounts: Account[] = []
  const accountCollection = await AccountModel.find({})
  accountCollection.forEach(account => {
    loadedAccounts.push(account)
  })
  if (loadedAccounts.length === 0) {
    accountFixtures()
  }
  activeAccounts = loadedAccounts
  logSuccess(`Loaded ${activeAccounts.length} accounts`, 'Database')
  return
}

export const saveActiveAccounts: PromiseFn<void, void> = async () => {
  const bulkOps = activeAccounts.map(account => {
    return {
      updateOne: {
        filter: { _id: account._id },
        update: account.toObject(),
        upsert: true,
      },
    }
  })
  await AccountModel.bulkWrite(bulkOps)
  logSuccess(`Saved ${activeAccounts.length} accounts`, 'Database')
  return
}

export const createAccount: PromiseFn<AccountData, Account> =
  async accountData => {
    const newAccount = new AccountModel(accountData)
    activeAccounts.push(newAccount)
    await newAccount.save()

    return newAccount
  }

export const hasAdmin: Fn<string, boolean> = accountId => {
  const account = activeAccounts.find(account => account._id === accountId)
  if (!account) return false
  const hasAdmin = account.scopes.find(scope => scope === Scopes.ADMIN)
  if (hasAdmin) return true
  else return false
}
