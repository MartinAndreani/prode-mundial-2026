export type MatchStatus =
  | 'TIMED'
  | 'SCHEDULED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'

export type Winner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null

export interface Match {
  id: string
  home_team: string
  away_team: string
  home_team_crest: string | null
  away_team_crest: string | null
  group_name: string | null
  stage: string
  utc_date: string
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  winner: Winner
  updated_at: string
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_home_goals: number
  predicted_away_goals: number
  points_earned: number
  scored: boolean
  created_at: string
  updated_at: string
}

export interface PredictionWithMatch extends Prediction {
  match: Match
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export interface LeaderboardEntry {
  user_id: string
  full_name: string
  avatar_url: string | null
  total_predictions: number
  total_points: number
  rank: number
}
