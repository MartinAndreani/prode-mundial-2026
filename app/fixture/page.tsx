import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Header'
import { GroupSection } from '@/components/GroupSection'
import { MatchNotifications } from '@/components/MatchNotifications'
import type { Match, Prediction } from '@/types'

export const revalidate = 60

export default async function FixturePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [matchesResult, predictionsResult] = await Promise.all([
    supabase.from('matches').select('*').order('utc_date', { ascending: true }),
    user
      ? supabase.from('predictions').select('*').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const matches: Match[] = matchesResult.data ?? []
  const predictions: Prediction[] = predictionsResult.data ?? []

  const predictionsMap = new Map(predictions.map((p) => [p.match_id, p]))

  // Agrupar por stage y luego por grupo
  const stages = Array.from(new Set(matches.map((m) => m.stage)))
  const groupStageMatches = matches.filter((m) => m.stage === 'GROUP_STAGE')
  const knockoutMatches = matches.filter((m) => m.stage !== 'GROUP_STAGE')

  const groups = Array.from(
    new Set(groupStageMatches.map((m) => m.group_name).filter(Boolean))
  ).sort()

  const hasMatches = matches.length > 0

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <MatchNotifications userId={user?.id} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Fixture</h1>
            <p className="text-sm text-gray-400">Mundial 2026 · Seleccioná tus predicciones</p>
          </div>
          {!user && (
            <a href="/login" className="btn-primary text-sm">
              Iniciar sesión para predecir
            </a>
          )}
        </div>

        {!hasMatches && (
          <div className="card p-10 text-center text-gray-500">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium">El fixture aún no está cargado.</p>
            <p className="text-sm mt-1">
              Usá el endpoint <code className="bg-gray-800 px-1 rounded">/api/sync-matches</code> para sincronizar desde football-data.org
            </p>
          </div>
        )}

        {/* Fase de Grupos */}
        {groupStageMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
              Fase de Grupos
            </h2>
            <div className="space-y-6">
              {groups.map((group) => (
                <GroupSection
                  key={group}
                  groupName={group!}
                  matches={groupStageMatches.filter((m) => m.group_name === group)}
                  predictionsMap={predictionsMap}
                  userId={user?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Eliminatorias */}
        {knockoutMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-500 rounded-full inline-block" />
              Eliminatorias
            </h2>
            <div className="space-y-3">
              {knockoutMatches.map((match) => (
                <div key={match.id} className="text-sm text-gray-400 text-center py-2">
                  {match.stage} — {match.home_team} vs {match.away_team}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
