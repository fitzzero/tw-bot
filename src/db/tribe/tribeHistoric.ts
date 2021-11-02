import { connection, model, Schema } from 'mongoose'
import { TribeData, TribeHistoric } from '../../types/tribe'
import { logger } from '../../utility/logger'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const tribeHistoricSchema = new Schema<TribeHistoric>(
  {
    _id: { type: String, required: true },
    tribeId: String,
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

export const TribeHistoricModel = model<TribeHistoric>(
  'TribeHistoric',
  tribeHistoricSchema
)

export const addTribeHistory = async (tribeData: TribeData): Promise<void> => {
  const tribeHistoricCollection = connection.collection('tribeHistorics')
  tribeHistoricCollection.insertOne(
    {
      ...tribeData,
      _id: undefined,
      tribeId: tribeData._id,
    },
    err => {
      if (err) {
        logger({
          prefix: 'alert',
          message: `Database: Failed to insert into TribeHistoric \n ${err}`,
        })
      }
    }
  )
}
