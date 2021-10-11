import fetch from 'cross-fetch'
import { parseCsv } from '../utility/logger'

export const queryVillage = async (world: number) => {
  console.log(world)
  fetch(`https://us${world}.tribalwars.us/map/village.txt`)
    .then(res => {
      if (res.status >= 400) {
        throw new Error('Bad response from server')
      }
      return res.text()
    })
    .then(data => {
      console.log(data)
      return parseCsv(data)
    })
    .catch(err => {
      console.error(err)
    })
}
