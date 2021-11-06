import { Fn, PromiseFn } from '../../@types/methods'
import { Player, PlayerData } from '../../@types/player'
import { logger, logSuccess } from '../../utility/logger'
import { PlayerModel } from './playerSchema'

let activePlayers: Player[] = []

export const getActivePlayers: Fn<void, PlayerData[]> = () => {
  return activePlayers
}

export const loadActivePlayers: PromiseFn<void, void> = async () => {
  const loadedPlayers: Player[] = []
  const playerCollection = await PlayerModel.find({})
  playerCollection.forEach(player => {
    loadedPlayers.push(player)
  })
  activePlayers = loadedPlayers
  logSuccess(`Loaded ${activePlayers.length} players`, 'Database')
  return
}

export const saveActivePlayers: PromiseFn<void, void> = async () => {
  const bulkOps = activePlayers.map(player => {
    return {
      updateOne: {
        filter: { _id: player._id },
        update: player.toObject(),
        upsert: true,
      },
    }
  })
  await PlayerModel.bulkWrite(bulkOps)
  logSuccess(`Saved ${activePlayers.length} players`, 'Database')
  return
}

export const updateOrCreatePlayer: Fn<PlayerData, void> = playerData => {
  try {
    const index = activePlayers.findIndex(
      player => player._id === playerData._id
    )
    if (index === -1) {
      const player = new PlayerModel(playerData)
      activePlayers.push(player)
    } else {
      const player = activePlayers[index]

      player.name = playerData.name
      player.tribe = playerData.tribe
      player.villages = playerData.villages
      player.points = playerData.points
      player.rank = playerData.rank
      player.lastSync = playerData.lastSync
      player.od = playerData.od
      player.oda = playerData.oda
      player.odd = playerData.odd
      player.ods = playerData.ods

      activePlayers[index] = player
    }
    return
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
