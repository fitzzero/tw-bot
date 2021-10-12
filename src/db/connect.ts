import mongoose, { connection } from 'mongoose'
import { logger } from '../utility/logger'
const dbConnection: string | undefined = process.env.WRDB

export const connectDb = async (world: number): Promise<void> => {
  if (!dbConnection) {
    logger({ prefix: 'alert', message: 'No Env Variable for DB Found' })
    return
  }
  if (connection?.readyState && connection.readyState > 0) {
    connection.close()
  }
  const parameters = `w${world}?retryWrites=true&w=majority`
  const uri = dbConnection + parameters
  mongoose
    .connect(uri, {
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
