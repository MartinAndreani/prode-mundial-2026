import { MatchCard } from './MatchCard'
import { groupLabel } from '@/lib/utils'
import type { Match, Prediction } from '@/types'

interface Props {
  groupName: string
  matches: Match[]
  predictionsMap: Map<string, Prediction>
  userId?: string
}

export function GroupSection({ groupName, matches, predictionsMap, userId }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          {groupLabel(groupName)}
        </h3>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">{matches.length} partidos</span>
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={predictionsMap.get(match.id)}
            userId={userId}
          />
        ))}
      </div>
    </div>
  )
}
