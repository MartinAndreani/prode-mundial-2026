'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Match } from '@/types'

interface Notification {
  id: string
  match: Match
  homeScore: number
  awayScore: number
}

export function MatchNotifications({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Suscribirse a cambios en la tabla matches (resultados nuevos)
    const channel = supabase
      .channel('match-results')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `status=eq.FINISHED` },
        (payload) => {
          const match = payload.new as Match
          if (match.home_score !== null && match.away_score !== null) {
            const notif: Notification = {
              id: `${match.id}-${Date.now()}`,
              match,
              homeScore: match.home_score,
              awayScore: match.away_score,
            }
            setNotifications((prev) => [...prev.slice(-2), notif])
            setTimeout(() => {
              setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
            }, 8000)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-xs">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="card bg-gray-900 border-green-700/50 p-4 shadow-xl animate-in slide-in-from-right"
        >
          <p className="text-xs text-green-400 font-bold mb-1">⚽ Partido finalizado</p>
          <p className="text-sm font-semibold text-white">
            {n.match.home_team} <span className="text-yellow-400">{n.homeScore} - {n.awayScore}</span> {n.match.away_team}
          </p>
          <p className="text-xs text-gray-500 mt-1">Los puntos se actualizaron</p>
        </div>
      ))}
    </div>
  )
}
