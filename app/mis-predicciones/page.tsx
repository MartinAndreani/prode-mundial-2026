import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { formatFullDateTime, groupLabel } from '@/lib/utils'
import type { PredictionWithMatch } from '@/types'
import Image from 'next/image'

export const revalidate = 30

export default async function MisPrediccionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('predictions')
    .select(`
      *,
      match:matches(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const predictions: PredictionWithMatch[] = (data ?? []) as PredictionWithMatch[]

  const total = predictions.reduce((sum, p) => sum + p.points_earned, 0)
  const scored = predictions.filter((p) => p.scored)
  const pending = predictions.filter((p) => !p.scored)

  return (
    <div className="min-h-screen">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Predicciones</h1>
            <p className="text-sm text-gray-400">{predictions.length} pronósticos en total</p>
          </div>
          <div className="card px-4 py-2 text-center">
            <p className="text-2xl font-black text-yellow-400">{total}</p>
            <p className="text-xs text-gray-400">puntos totales</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <p className="text-xl font-bold">{predictions.length}</p>
            <p className="text-xs text-gray-400">Predicciones</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-green-400">
              {scored.filter((p) => p.points_earned > 0).length}
            </p>
            <p className="text-xs text-gray-400">Acertadas</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-blue-400">{pending.length}</p>
            <p className="text-xs text-gray-400">Pendientes</p>
          </div>
        </div>

        {predictions.length === 0 && (
          <div className="card p-10 text-center text-gray-500">
            <div className="text-4xl mb-3">🎯</div>
            <p>Todavía no hiciste ninguna predicción.</p>
            <a href="/fixture" className="btn-primary inline-block mt-4 text-sm">
              Ver fixture
            </a>
          </div>
        )}

        <div className="space-y-3">
          {predictions.map((p) => {
            const m = p.match
            const isFinished = m.status === 'FINISHED'
            const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED'

            return (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {groupLabel(m.group_name)} · {formatFullDateTime(m.utc_date)}
                  </span>
                  {isFinished && (
                    <span className={`text-sm font-bold ${
                      p.points_earned === 3 ? 'text-yellow-400' :
                      p.points_earned === 1 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {p.points_earned === 3 ? '⭐ 3 pts' :
                       p.points_earned === 1 ? '✓ 1 pt' : '✗ 0 pts'}
                    </span>
                  )}
                  {isLive && <span className="badge-live">EN VIVO</span>}
                  {!isFinished && !isLive && (
                    <span className="badge-scheduled">Pendiente</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Equipo local */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-medium text-right">{m.home_team}</span>
                    {m.home_team_crest && (
                      <Image src={m.home_team_crest} alt={m.home_team} width={24} height={24} />
                    )}
                  </div>

                  {/* Scores */}
                  <div className="text-center min-w-[80px]">
                    {isFinished ? (
                      <div>
                        <div className="text-lg font-black">
                          {m.home_score} - {m.away_score}
                        </div>
                        <div className="text-xs text-gray-500">
                          tu pred: {p.predicted_home_goals}-{p.predicted_away_goals}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-black text-green-400">
                        {p.predicted_home_goals} - {p.predicted_away_goals}
                      </div>
                    )}
                  </div>

                  {/* Equipo visitante */}
                  <div className="flex items-center gap-2 flex-1">
                    {m.away_team_crest && (
                      <Image src={m.away_team_crest} alt={m.away_team} width={24} height={24} />
                    )}
                    <span className="text-sm font-medium">{m.away_team}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
