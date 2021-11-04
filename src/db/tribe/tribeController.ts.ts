import { Fn, PromiseFn } from '../../types/methods'
import { Tribe, TribeData } from '../../types/tribe'
import { logger, logSuccess } from '../../utility/logger'
import { TribeModel } from './tribeSchema'

let activeTribes: Tribe[] = []

export const getActiveTribes: Fn<void, Tribe[]> = () => {
  return activeTribes
}

export const loadActiveTribes: PromiseFn<void, void> = async () => {
  const loadedTribes: Tribe[] = []
  const tribeCollection = await TribeModel.find({})
  tribeCollection.forEach(tribe => {
    loadedTribes.push(tribe)
  })
  activeTribes = loadedTribes
  logSuccess(`Loaded ${activeTribes.length} tribes`, 'Database')
  return
}

export const saveActiveTribes: PromiseFn<void, void> = async () => {
  const bulkOps = activeTribes.map(village => {
    return {
      updateOne: {
        filter: { _id: village._id },
        update: village.toJSON,
        upsert: true,
      },
    }
  })

  await TribeModel.bulkWrite(bulkOps)
  logSuccess(`Saved ${activeTribes.length} tribes`, 'Database')
  return
}

export const updateOrCreateTribe: Fn<TribeData, void> = tribeData => {
  try {
    const index = activeTribes.findIndex(tribe => tribe._id === tribeData._id)
    if (index === -1) {
      const tribe = new TribeModel(tribeData)
      activeTribes.push(tribe)
    } else {
      const tribe = activeTribes[index]
      tribe.name = tribeData.name
      tribe.tag = tribeData.tag
      tribe.members = tribeData.members
      tribe.villages = tribeData.villages
      tribe.points = tribeData.points
      tribe.allPoints = tribeData.allPoints
      tribe.rank = tribeData.rank
      tribe.od = tribeData.od
      tribe.oda = tribeData.oda
      tribe.odd = tribeData.odd
      tribe.lastSync = tribeData.lastSync

      activeTribes[index] = tribe
    }
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
