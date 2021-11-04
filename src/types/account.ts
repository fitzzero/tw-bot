import { Moment } from 'moment'
import { Document } from 'mongoose'

export type Account = AccountData & Document

export interface AccountData {
  _id: string
  handle: string
  scopes: Scopes[]
  lastSync: Moment
}

export enum Scopes {
  ADMIN = 'Admin',
  MOD = 'Mod',
  MEMBER = 'Member',
}
