import mongoose from 'mongoose'

export const connect = async (connectionString: string): Promise<void> => {
  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
}
