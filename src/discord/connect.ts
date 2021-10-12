import Discord from 'discord.js'

const token = process.env.WRTOKEN
const discordClient = new Discord.Client()

export const startDiscord = (): void => {
  discordClient.login(token)
}

export const discord = discordClient
