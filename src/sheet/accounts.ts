import { keys } from 'ts-transformer-keys'
import { getActiveGuild } from '../discord/guild'
import { logAlert } from '../utility/logger'
import { getMinutesSince, nowString } from '../utility/time'
import { settings, WarRoomSettings } from './settings'
import { RowStructure, SheetData } from './sheetData'

export interface AccountsData extends RowStructure {
  id: string
  handle: string
  browser: string
  mobile: string
  lastSignOn: string
  minutesActive: string
  todos: string
}

const headers = keys<AccountsData>().map(key => key.toString())

class Accounts extends SheetData<AccountsData> {
  constructor(tabTitle: string, tabHeaders: string[]) {
    super(tabTitle, tabHeaders)
  }

  addRole = async (id: string, property: 'browser' | 'mobile') => {
    let success = true
    const accountData = this.getById(id)
    if (accountData) {
      // Update data
      const updateData = { ...accountData, lastSignOn: nowString() }
      updateData[property] = 'TRUE'
      success = this.update(updateData)
    } else {
      const member = await this.getDiscordMember(id)
      if (!member) return
      const newAccount: AccountsData = {
        id: member.id,
        handle: member.displayName,
        browser: 'FALSE',
        mobile: 'FALSE',
        lastSignOn: nowString(),
        minutesActive: '0',
        todos: '0',
      }
      newAccount[property] = 'TRUE'
      success = await this.add(newAccount)
    }

    if (!success) return false

    // Update discord
    const role = await this.getDiscordRole(property)
    const member = await this.getDiscordMember(id)
    if (!role || !member) return false
    try {
      success = !!(await member?.roles.add(role))
    } catch (err) {
      logAlert(err, 'Discord Accounts')
    }
    return success
  }

  clearAccount = async (id: string) => {
    const accountData = this.getById(id)
    if (accountData?.browser == 'TRUE') {
      await this.clearRole('browser')
    }
    if (accountData?.mobile == 'TRUE') {
      await this.clearRole('mobile')
    }
  }

  clearRole = async (property: 'browser' | 'mobile') => {
    const accountData = this.getByProperty(property, 'TRUE')
    if (!accountData) return

    const timeOnline = getMinutesSince(accountData.lastSignOn) || 0
    const total = parseInt(accountData.minutesActive) || 0
    const minutesActive = `${total + timeOnline}`

    const newData = { ...accountData, minutesActive }
    newData[property] = 'FALSE'
    // Update data
    this.update(newData)

    // Update discord
    const role = await this.getDiscordRole(property)
    const member = await this.getDiscordMember(accountData.id)
    if (!role || !member) return
    try {
      await member?.roles.remove(role)
    } catch (err) {
      logAlert(err, 'Discord Accounts')
    }
  }

  getDiscordMember = async (id: string) => {
    const guild = await getActiveGuild()
    try {
      const member = await guild.members.fetch(id)
      return member
    } catch (err) {
      logAlert(err, 'Discord Accounts')
    }
    return
  }

  getDiscordRole = async (property: 'browser' | 'mobile') => {
    const roleId = settings.getSettingValue(
      property == 'browser'
        ? WarRoomSettings.browserId
        : WarRoomSettings.mobileId
    )
    if (!roleId) {
      logAlert('No browser roleId set', 'Settings')
      return
    }
    const guild = await getActiveGuild()
    try {
      const role = await guild.roles.fetch(roleId)
      return role
    } catch (err) {
      logAlert(err, 'Discord Accounts')
    }
    return
  }

  setAccountBrowser = async (id: string) => {
    await this.clearRole('browser')
    await this.addRole(id, 'browser')
  }

  setAccountMobile = async (id: string) => {
    await this.clearRole('mobile')
    await this.addRole(id, 'mobile')
  }
}

export const accounts = new Accounts('accounts', headers)
