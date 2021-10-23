import { Todoist } from 'todoist'
const todoistConnection: string | undefined = process.env.WRTODOIST

let api = undefined
if (todoistConnection) api = Todoist(todoistConnection)

export const todoist = api
