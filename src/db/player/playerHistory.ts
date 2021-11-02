import { connection, model, Schema } from 'mongoose'
import { PlayerData, PlayerHistoric } from '../../types/player'
import { logger } from '../../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const playerHistoricSchema = new Schema<PlayerHistoric>(
  {
    _id: { type: String, required: true },
    playerId: String,
    name: String,
    tribe: String,
    villages: Number,
    points: Number,
    rank: Number,
    od: Number,
    oda: Number,
    odd: Number,
    ods: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const PlayerHistoryModel = model<PlayerHistoric>(
  'PlayerHistoric',
  playerHistoricSchema
)

export const addPlayerHistory = async (
  playerData: PlayerData
): Promise<void> => {
  const playerHistoricCollection = connection.collection('playerHistorics')
  playerHistoricCollection.insertOne(
    {
      ...playerData,
      _id: undefined,
      playerId: playerData._id,
    },
    err => {
      if (err) {
        logger({
          prefix: 'alert',
          message: `Database: Failed to insert into PlayerHistory \n ${err}`,
        })
      }
    }
  )
}
