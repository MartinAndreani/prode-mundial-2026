import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getFinishedOrLiveMatches, type FDMatch } from '@/lib/football-api'
import { calculatePoints } from '@/lib/points'

// GET /api/cron/update-results
// Vercel lo ejecuta cada 5 minutos (vercel.json).
// Actualiza resultados de partidos en vivo/finalizados y suma puntos.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const matches: FDMatch[] = await getFinishedOrLiveMatches()
    if (matches.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, scored: 0 })
    }

    const supabase = await createServiceClient()
    let updatedMatches = 0
    let scoredPredictions = 0

    for (const m of matches) {
      const matchId = String(m.id)

      // Actualizar estado y resultado del partido
      const { error: matchErr } = await supabase
        .from('matches')
        .update({
          status: m.status,
          home_score: m.score.fullTime.home,
          away_score: m.score.fullTime.away,
          winner: m.score.winner,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)

      if (matchErr) continue
      updatedMatches++

      // Solo calcular puntos si el partido terminó y tiene score
      if (
        m.status !== 'FINISHED' ||
        m.score.fullTime.home === null ||
        m.score.fullTime.away === null
      ) continue

      const actualHome = m.score.fullTime.home!
      const actualAway = m.score.fullTime.away!

      // Buscar predicciones no puntuadas aún
      const { data: predictions } = await supabase
        .from('predictions')
        .select('id, predicted_home_goals, predicted_away_goals')
        .eq('match_id', matchId)
        .eq('scored', false)

      if (!predictions || predictions.length === 0) continue

      for (const pred of predictions) {
        const points = calculatePoints(
          pred.predicted_home_goals,
          pred.predicted_away_goals,
          actualHome,
          actualAway
        )

        await supabase
          .from('predictions')
          .update({
            points_earned: points,
            scored: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pred.id)

        scoredPredictions++
      }
    }

    return NextResponse.json({ ok: true, updatedMatches, scoredPredictions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
