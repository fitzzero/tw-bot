import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Page } from 'playwright'
import { settings, WRSettings } from '../../sheet/settings'
import { units } from '../../sheet/units'
import { getDistance } from '../../tw/village'
import { saveScreenshot } from '../../utility/screenshot'
import { minToDuration } from '../../utility/time'
import { wait } from '../../utility/wait'

import { Command } from '../commands'
import { villageMessage } from '../messages/village'
import { closeCommand, parseInteractionCoordinates } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('map')
  .addStringOption(option =>
    option
      .setName('coordinates')
      .setDescription('Coordinates of village (123|456)')
      .setRequired(true)
  )
  .setDescription('Get map and info of village')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const village = await parseInteractionCoordinates(interaction)
  if (!village) return
  // Meta data
  const mapConfig = settings.getValue(WRSettings.mapconfig)
  const distance = getDistance(village)
  const ram = units.getById('ram')
  const axe = units.getById('axe')
  const spy = units.getById('spy')

  // No context close (TODO) if missing metadata
  if (!distance || !mapConfig || !ram || !axe || !spy) {
    await closeCommand(interaction)
    return
  }

  // Build Message
  const fields = Math.round(distance)
  const ramSpeed = Math.round(parseInt(ram.speed) * distance)
  const axeSpeed = Math.round(parseInt(axe.speed) * distance)
  const spySpeed = Math.round(parseInt(spy.speed) * distance)

  const description = `Distance: ${fields} fields | ram: ${minToDuration(
    ramSpeed
  )} | axe: ${minToDuration(axeSpeed)} | scout: ${minToDuration(spySpeed)}`
  const message = villageMessage({ village, description })

  //Build File
  const pageFn = async (page: Page) => {
    await wait(300)
    // @ts-ignore
    await page.evaluate(() => display.panel('messages', 0, 1))
    await wait(100)
    await page.evaluate(() => {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const x = urlParams.get('x')
      const y = urlParams.get('y')
      // @ts-ignore
      manual(parseInt(x), parseInt(y))
    })
    await wait(300)
  }

  const file = await saveScreenshot({
    clip: { x: 40, y: 77, width: 1240, height: 723 },
    height: 800,
    id: 'map',
    pageFn,
    url: `${mapConfig}?x=${village.x}&y=${village.y}`,
    width: 1280,
  })

  await interaction.editReply({ ...message, files: [file] })
  return
}

export const map: Command = {
  documentation,
  controller,
}
