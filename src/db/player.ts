import { Schema, model } from 'mongoose'
import { Player, PlayerData } from '../types/player'
import { logger } from '../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const playerSchema = new Schema<Player>(
  {
    _id: { type: String, required: true },
    name: String,
    tribe: String,
    villages: Number,
    points: Number,
    rank: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const PlayerModel = model<Player>('Player', playerSchema)

export const updateOrCreatePlayer = async (
  playerData: PlayerData
): Promise<Player | null> => {
  try {
    let player = await PlayerModel.findById(playerData?._id)
    if (!player) {
      player = new PlayerModel(playerData)
    } else {
      player.name = playerData.name
      player.tribe = playerData.tribe
      player.villages = playerData.villages
      player.points = playerData.points
      player.rank = playerData.rank
      player.lastSync = playerData.lastSync
    }
    player.save()
    return player
  } catch (err) {
    logger({ prefix: 'alert', message: `${err}` })
    return null
  }
}
