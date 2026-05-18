import Image from 'next/image'
import type { LeaderboardEntry } from '@/types'

interface Props {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-500">
        <div className="text-4xl mb-3">🏆</div>
        <p>Todavía no hay puntos en la tabla.</p>
        <p className="text-sm mt-1">Los puntos se suman cuando terminan los partidos.</p>
      </div>
    )
  }

  const leader = entries[0]

  return (
    <div className="space-y-4">
      {/* Leader destacado */}
      {leader && (
        <div className="card p-5 border-yellow-700/40 bg-gradient-to-br from-yellow-900/20 to-transparent">
          <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-3">
            🏆 Líder
          </p>
          <div className="flex items-center gap-4">
            {leader.avatar_url ? (
              <Image
                src={leader.avatar_url}
                alt={leader.full_name ?? ''}
                width={52}
                height={52}
                className="rounded-full ring-2 ring-yellow-500"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-yellow-800/50 flex items-center justify-center text-xl">
                {leader.full_name?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-lg text-white">{leader.full_name ?? 'Anónimo'}</p>
              <p className="text-sm text-gray-400">{leader.total_predictions} predicciones</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-400">{leader.total_points}</p>
              <p className="text-xs text-gray-500">puntos</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla completa */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 text-left w-10">#</th>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-right">Pred.</th>
              <th className="px-4 py-3 text-right">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {entries.map((entry, i) => {
              const isMe = entry.user_id === currentUserId
              const isTop3 = i < 3

              return (
                <tr
                  key={entry.user_id}
                  className={`transition-colors ${
                    isMe ? 'bg-green-900/20' : 'hover:bg-gray-800/30'
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    {isTop3 ? (
                      <span className="text-lg">{MEDALS[i]}</span>
                    ) : (
                      <span className="text-gray-600 font-mono">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {entry.avatar_url ? (
                        <Image
                          src={entry.avatar_url}
                          alt={entry.full_name ?? ''}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                          {entry.full_name?.[0] ?? '?'}
                        </div>
                      )}
                      <div>
                        <span className={`font-medium ${isMe ? 'text-green-400' : 'text-gray-200'}`}>
                          {entry.full_name ?? 'Anónimo'}
                        </span>
                        {isMe && (
                          <span className="ml-1 text-xs text-green-600">(vos)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {entry.total_predictions}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-black text-lg ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300' :
                      i === 2 ? 'text-orange-400' :
                      isMe ? 'text-green-400' : 'text-white'
                    }`}>
                      {entry.total_points}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
