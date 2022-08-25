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
  const village = await parseInteractionCoordinates(interaction, 'target')
  const origin = await parseInteractionCoordinates(interaction, 'origin', false)
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
  const pageFn = async (page: Page) => {
    await wait(300)
    // @ts-ignore
    await page.evaluate(() => display.panel('messages', 0, 1))
    await wait(100)
    await page.evaluate(() => {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const targetX = urlParams.get('tX')
      const targetY = urlParams.get('tY')
      const startX = urlParams.get('sX')
      const startY = urlParams.get('sY')
      const zoom = urlParams.get('zoom') || '0'
      if (startX && startY) {
        // @ts-ignore
        manual(parseInt(startX), parseInt(startY), 1)
      }
      for (let i = 0; i < parseInt(zoom); i++) {
        // @ts-ignore
        zoom(0, -3)
      }
      // @ts-ignore
      manual(parseInt(targetX), parseInt(targetY))
    })
    await wait(600)
  }
  const alertSettings = settings.getAlertSettings()
  let url = `${mapConfig}?tX=${village.x}&tY=${village.y}`
  let originX = alertSettings?.x || 0
  let originY = alertSettings?.y || 0
  if (origin) {
    url += `&sX=${origin.x}&sY=${origin.y}`
    originX = parseInt(origin.x) || 0
    originY = parseInt(origin.y) || 0
  }
  const x = Math.abs(parseInt(village.x) - originX)
  const y = Math.abs(parseInt(village.y) - originY)
  let zoom = 0
  if (distance > 12) zoom = 1
  if (distance > 16) zoom = 2
  if (distance > 25) zoom = 3
  if (distance > 48) zoom = 4
  url += `&x${x}&y=${y}&zoome=${zoom}`

  const file = await saveScreenshot({
    clip: { x: 340, y: 259, width: 640, height: 360 },
    height: 800,
    id: 'map',
    pageFn,
    url,
    width: 1280,
  })

  await interaction.editReply({ ...message, files: [file] })
  return
}

export const map: Command = {
  documentation,
  controller,
}
