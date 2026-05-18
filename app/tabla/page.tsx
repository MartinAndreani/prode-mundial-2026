import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Header'
import { Leaderboard } from '@/components/Leaderboard'

export const revalidate = 60

export default async function TablaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  return (
    <div className="min-h-screen">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Tabla de Posiciones</h1>
          <p className="text-sm text-gray-400">Mundial 2026 · Prode entre amigos</p>
        </div>

        <Leaderboard entries={leaderboard ?? []} currentUserId={user?.id} />
      </main>
    </div>
  )
}
