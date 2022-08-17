import { worldPath } from './world'

export const getTribeUrl = (id: string) => {
  const url = `${worldPath()}game.php?screen=info_ally&id=${id}`
  return url
}
