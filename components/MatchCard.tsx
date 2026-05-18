'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatMatchDate, formatMatchTime } from '@/lib/utils'
import { PredictionModal } from './PredictionModal'
import type { Match, Prediction } from '@/types'

interface Props {
  match: Match
  prediction?: Prediction
  userId?: string
}

export function MatchCard({ match, prediction, userId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [localPrediction, setLocalPrediction] = useState<Prediction | undefined>(prediction)

  const matchDate = new Date(match.utc_date)
  const now = new Date()
  const isStarted = matchDate <= now
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const canPredict = !!userId && !isStarted && !isFinished

  function StatusBadge() {
    if (isLive) return <span className="badge-live">⚡ EN VIVO</span>
    if (isFinished) return <span className="badge-finished">Finalizado</span>
    return <span className="badge-scheduled">{formatMatchDate(match.utc_date)}</span>
  }

  function PointsBadge() {
    if (!isFinished || !localPrediction?.scored) return null
    const pts = localPrediction.points_earned
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        pts === 3 ? 'bg-yellow-500/20 text-yellow-400' :
        pts === 1 ? 'bg-green-500/20 text-green-400' :
        'bg-gray-700 text-gray-400'
      }`}>
        {pts === 3 ? '⭐' : pts === 1 ? '✓' : '✗'} {pts} {pts === 1 ? 'pt' : 'pts'}
      </span>
    )
  }

  return (
    <>
      <div className={`card p-4 transition-all ${isLive ? 'border-red-800/50 ring-1 ring-red-900/30' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge />
          <div className="flex items-center gap-2">
            {!isLive && !isFinished && (
              <span className="text-xs text-gray-500">{formatMatchTime(match.utc_date)} hs</span>
            )}
            <PointsBadge />
          </div>
        </div>

        {/* Teams row */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-semibold text-right leading-tight">{match.home_team}</span>
            {match.home_team_crest ? (
              <Image src={match.home_team_crest} alt={match.home_team} width={32} height={32} className="object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                {match.home_team.slice(0, 2)}
              </div>
            )}
          </div>

          {/* Score / VS */}
          <div className="min-w-[90px] text-center">
            {isFinished || isLive ? (
              <div>
                <span className="text-2xl font-black text-white">
                  {match.home_score ?? 0} - {match.away_score ?? 0}
                </span>
                {isLive && (
                  <div className="text-xs text-red-400 font-bold mt-0.5">EN VIVO</div>
                )}
              </div>
            ) : (
              <span className="text-xl text-gray-600 font-light">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1">
            {match.away_team_crest ? (
              <Image src={match.away_team_crest} alt={match.away_team} width={32} height={32} className="object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                {match.away_team.slice(0, 2)}
              </div>
            )}
            <span className="text-sm font-semibold leading-tight">{match.away_team}</span>
          </div>
        </div>

        {/* Prediction bar */}
        <div className="mt-3 pt-3 border-t border-gray-800/60">
          {localPrediction ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tu predicción:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-400">
                  {localPrediction.predicted_home_goals} - {localPrediction.predicted_away_goals}
                </span>
                {canPredict && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs text-gray-500 hover:text-white underline"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            </div>
          ) : canPredict ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full btn-primary text-sm py-1.5"
            >
              Predecir resultado
            </button>
          ) : !userId ? (
            <p className="text-xs text-gray-600 text-center">
              <a href="/login" className="text-green-600 hover:text-green-500">Iniciá sesión</a> para predecir
            </p>
          ) : (
            <p className="text-xs text-gray-600 text-center">Sin predicción</p>
          )}
        </div>
      </div>

      {showModal && (
        <PredictionModal
          match={match}
          existing={localPrediction}
          onClose={() => setShowModal(false)}
          onSaved={(pred) => {
            setLocalPrediction(pred)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}
