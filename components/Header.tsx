'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/fixture', label: 'Fixture' },
  { href: '/tabla', label: 'Tabla' },
  { href: '/mis-predicciones', label: 'Mis pronósticos' },
]

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/fixture" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">⚽</span>
          <span className="hidden sm:block text-sm">Prode Mundial 2026</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-green-900/60 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <Image
                src={user.user_metadata.avatar_url}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.user_metadata?.full_name?.split(' ')[0]}
            </span>
            <button
              onClick={signOut}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary text-sm">
            Entrar
          </Link>
        )}
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-gray-800/50">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 text-center py-2 text-xs font-medium transition-colors',
              pathname === href
                ? 'text-green-400 border-b-2 border-green-500'
                : 'text-gray-500'
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  )
}
