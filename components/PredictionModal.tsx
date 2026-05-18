'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import type { Match, Prediction } from '@/types'

interface Props {
  match: Match
  existing?: Prediction
  onClose: () => void
  onSaved: (prediction: Prediction) => void
}

export function PredictionModal({ match, existing, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [homeGoals, setHomeGoals] = useState(existing?.predicted_home_goals ?? 0)
  const [awayGoals, setAwayGoals] = useState(existing?.predicted_away_goals ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function predictedResult() {
    if (homeGoals > awayGoals) return `Gana ${match.home_team}`
    if (awayGoals > homeGoals) return `Gana ${match.away_team}`
    return 'Empate'
  }

  async function save() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No estás autenticado'); setLoading(false); return }

    const payload = {
      user_id: user.id,
      match_id: match.id,
      predicted_home_goals: homeGoals,
      predicted_away_goals: awayGoals,
    }

    const { data, error: err } = await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'user_id,match_id' })
      .select()
      .single()

    if (err) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    onSaved(data as Prediction)
  }

  function GoalInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-xl font-bold transition-colors flex items-center justify-center"
        >
          −
        </button>
        <span className="text-3xl font-black w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-xl font-bold transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs text-gray-500 text-center mb-1">Predecí el resultado</p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              {match.home_team_crest && (
                <Image src={match.home_team_crest} alt={match.home_team} width={36} height={36} />
              )}
              <span className="text-xs text-center font-medium max-w-[80px] leading-tight">
                {match.home_team}
              </span>
            </div>
            <span className="text-gray-600 font-light text-lg">vs</span>
            <div className="flex flex-col items-center gap-1">
              {match.away_team_crest && (
                <Image src={match.away_team_crest} alt={match.away_team} width={36} height={36} />
              )}
              <span className="text-xs text-center font-medium max-w-[80px] leading-tight">
                {match.away_team}
              </span>
            </div>
          </div>
        </div>

        {/* Score inputs */}
        <div className="flex items-center justify-center gap-6">
          <GoalInput value={homeGoals} onChange={setHomeGoals} />
          <span className="text-2xl text-gray-600">-</span>
          <GoalInput value={awayGoals} onChange={setAwayGoals} />
        </div>

        {/* Result preview */}
        <div className="text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
            homeGoals > awayGoals ? 'bg-blue-900/50 text-blue-300' :
            awayGoals > homeGoals ? 'bg-orange-900/50 text-orange-300' :
            'bg-purple-900/50 text-purple-300'
          }`}>
            {predictedResult()}
          </span>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {loading ? 'Guardando...' : existing ? 'Actualizar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
