import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Page } from 'playwright'
import { settings, WRSettings } from '../../sheet/settings'
import { TWUnits, units } from '../../sheet/units'
import { getDistance } from '../../tw/village'
import { saveScreenshot } from '../../utility/screenshot'
import { minToDuration } from '../../utility/time'
import { wait } from '../../utility/wait'

import { Command } from '../commands'
import { getDiscordEmoji } from '../guild'
import { villageMessage } from '../messages/village'
import { closeCommand, parseInteractionCoordinates } from './canned'

const documentation = new SlashCommandBuilder()
  .setName('map')
  .addStringOption(option =>
    option
      .setName('target')
      .setDescription('Target coordinates (123|456)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('origin')
      .setDescription('Optional origin coordinates (123|456)')
      .setRequired(false)
  )
  .setDescription('Get map and info of village')

const controller = async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return
  await interaction.deferReply()
  const village = await parseInteractionCoordinates({
    interaction,
    optionLabel: 'target',
  })
  const origin = await parseInteractionCoordinates({
    interaction,
    optionLabel: 'origin',
  })
  if (!village) return
  // Meta data
  const mapConfig = settings.getValue(WRSettings.mapconfig)
  const distance = getDistance(village, origin)

  // No context close (TODO) if missing metadata
  if (!distance || !mapConfig) {
    await closeCommand(interaction)
    return
  }

  // Build Message
  const fields = Math.round(distance)
  const compareUnits = [TWUnits.snob, TWUnits.ram, TWUnits.axe, TWUnits.spy]

  let description = `Distance: ${fields} fields`
  for (const id of compareUnits) {
    const unitSpeed = Math.round(
      parseInt(units.getById(id)?.speed || '0') * distance
    )
    const emoji = await getDiscordEmoji(id)
    description += ` | ${emoji} ${minToDuration(unitSpeed)}`
  }
  const message = villageMessage({ village, description })

  //Build File
  const alertSettings = settings.getAlertSettings()
  let url = `${mapConfig}?tX=${village.x}&tY=${village.y}`
  // Set map origin to url params
  let originX = alertSettings?.x || 0
  let originY = alertSettings?.y || 0
  if (origin) {
    originX = parseInt(origin.x) || 0
    originY = parseInt(origin.y) || 0
  }
  url += `&sX=${originX}&sY=${originY}`
  // Set map center to url params
  const x = Math.round(
    parseInt(village.x) + (originX - parseInt(village.x)) * 0.5
  )
  const y = Math.round(
    parseInt(village.y) + (originY - parseInt(village.y)) * 0.5
  )
  let zoom = 0
  if (distance > 12) zoom = 1
  if (distance > 16) zoom = 2
  if (distance > 25) zoom = 3
  if (distance > 48) zoom = 4
  url += `&x=${x}&y=${y}`

  const pageFn = async (page: Page) => {
    await wait(300)
    // @ts-ignore
    await page.evaluate(() => display.panel('messages', 0, 1))
    await wait(1000)
    for (let i = 0; i < zoom; i++) {
      await page.keyboard.press('o')
    }
    await page.evaluate(() => {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const targetX = urlParams.get('tX')
      const targetY = urlParams.get('tY')
      const startX = urlParams.get('sX')
      const startY = urlParams.get('sY')
      const editMap = async () => {
        // @ts-ignore
        manual(parseInt(startX), parseInt(startY), 1)
        // @ts-ignore
        manual(parseInt(targetX), parseInt(targetY))
      }
      setTimeout(function () {
        editMap()
      }, 200)
      editMap()
    })
    await wait(600)
  }

  const file = await saveScreenshot({
    clip: { x: 340, y: 259, width: 640, height: 360 },
    height: 800,
    id: 'map',
    pageFn,
    url,
    width: 1280,
  })

  await interaction.editReply({ ...message, files: [file.path] })
  return
}

export const map: Command = {
  documentation,
  controller,
}
