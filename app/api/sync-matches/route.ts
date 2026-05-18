import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getWorldCupMatches, type FDMatch } from '@/lib/football-api'

// POST /api/sync-matches
// Descarga todos los partidos del Mundial desde football-data.org y los guarda en Supabase.
// Llamar una vez manualmente antes del torneo (o cuando se actualice el fixture).
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const matches: FDMatch[] = await getWorldCupMatches()
    const supabase = await createServiceClient()

    const rows = matches.map((m) => ({
      id: String(m.id),
      home_team: m.homeTeam.name,
      away_team: m.awayTeam.name,
      home_team_crest: m.homeTeam.crest ?? null,
      away_team_crest: m.awayTeam.crest ?? null,
      group_name: m.group ?? null,
      stage: m.stage,
      utc_date: m.utcDate,
      status: m.status,
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      winner: m.score.winner,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'id' })

    if (error) throw error

    return NextResponse.json({ ok: true, synced: rows.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
