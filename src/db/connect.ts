import mongoose from 'mongoose'
import { logger } from '../utility/logger'

export const connectDb = async (connectionString: string): Promise<void> => {
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .catch(err => {
      logger({
        prefix: 'alert',
        message: `Database: Connection Error\n${err}`,
      })
    })
}
