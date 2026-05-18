const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`football-data.org error: ${res.status} ${path}`)
  return res.json()
}

export interface FDMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; crest: string }
  awayTeam: { id: number; name: string; crest: string }
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
}

export async function getWorldCupMatches(): Promise<FDMatch[]> {
  const data = await apiFetch('/competitions/WC/matches')
  return data.matches ?? []
}

export async function getFinishedOrLiveMatches(): Promise<FDMatch[]> {
  const data = await apiFetch('/competitions/WC/matches?status=IN_PLAY,PAUSED,FINISHED')
  return data.matches ?? []
}
