import { connection, model, Schema } from 'mongoose'
import { VillageData, VillageHistoric } from '../types/village'
import { logger } from '../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const villageHistoricSchema = new Schema<VillageHistoric>(
  {
    _id: { type: String, required: true },
    villageId: String,
    name: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    player: Number,
    points: Number,
    rank: Number,
    lastSync: Date,
  },
  schemaOptions
)

export const VillageHistoryModel = model<VillageHistoric>(
  'VillageHistoric',
  villageHistoricSchema
)

export const addVillageHistory = async (
  villageData: VillageData
): Promise<void> => {
  const villageHistoryCollection = connection.collection('villageHistorics')
  villageHistoryCollection.insertOne(
    {
      ...villageData,
      _id: undefined,
      villageId: villageData._id,
    },
    err => {
      if (err) {
        logger({
          prefix: 'alert',
          message: `Database: Failed to insert into VillageHistory \n ${err}`,
        })
      }
    }
  )
}
