import { Schema, model } from 'mongoose'
import { Account } from '../../types/account'

const schemaOptions = {
  toJSON: { virtuals: true },
}

export const accountSchema = new Schema<Account>(
  {
    _id: { type: String, required: true },
    handle: String,
    scopes: [String],
    lastSync: Date,
  },
  schemaOptions
)

export const AccountModel = model<Account>('Account', accountSchema)
