import { Coordinate } from '../types/world'

export const coordinatesInRange = (
  center: Coordinate,
  radius: number,
  check: Coordinate
): boolean => {
  const withinX = check.x <= center.x + radius && check.x >= center.x - radius
  const withinY = check.y <= center.y + radius && check.y >= center.y - radius
  if (withinX && withinY) return true
  return false
}
