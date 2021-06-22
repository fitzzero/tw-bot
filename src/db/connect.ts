import mongoose from 'mongoose'
import { logger } from '../utility/logger'

export const connect = async (connectionString: string): Promise<any> => {
  mongoose.connection.on('error', () => {
    logger({ prefix: 'alert', message: 'Database Error: \n' })
  })
  mongoose.connection.on('open', () => {
    logger({ prefix: 'success', message: 'Database Open' })
  })

  mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
}
