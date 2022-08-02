import { ButtonInteraction } from 'discord.js'
import { accounts } from '../../sheet/accounts'
import { Button } from '../buttons'
import { syncDashboard } from '../dashboard'
import { onlineDashboard } from '../dashboardMessages/online'

const handleBrowser = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
  await accounts.setAccountBrowser(interaction.user.id)
  syncDashboard(onlineDashboard)
}

const handleMobile = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
  await accounts.setAccountMobile(interaction.user.id)
  syncDashboard(onlineDashboard)
}

const handleOffline = async (interaction: ButtonInteraction) => {
  await interaction.deferUpdate()
  await accounts.clearAccount(interaction.user.id)
  syncDashboard(onlineDashboard)
}

export const onlineBrowser: Button = {
  customId: 'online-browser',
  controller: handleBrowser,
}

export const onlineMobile: Button = {
  customId: 'online-mobile',
  controller: handleMobile,
}

export const onlineOffline: Button = {
  customId: 'online-offline',
  controller: handleOffline,
}
