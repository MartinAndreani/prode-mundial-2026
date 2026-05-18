import type { Winner } from '@/types'

function predictedWinner(home: number, away: number): Winner {
  if (home > away) return 'HOME_TEAM'
  if (away > home) return 'AWAY_TEAM'
  return 'DRAW'
}

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3
  if (predictedWinner(predictedHome, predictedAway) === predictedWinner(actualHome, actualAway)) return 1
  return 0
}
