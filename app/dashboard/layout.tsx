import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const navItems = [
    { href: '/dashboard', label: '📊 Resumen', icon: '📊', adminOnly: false },
    { href: '/dashboard/calendario', label: '📅 Calendario', icon: '📅', adminOnly: false },
    { href: '/dashboard/predicciones', label: '🎯 Mis Predicciones', icon: '🎯', adminOnly: false },
    { href: '/dashboard/brackets', label: '🏆 Brackets', icon: '🏆', adminOnly: false },
    { href: '/dashboard/ranking', label: '📈 Ranking', icon: '📈', adminOnly: false },
    { href: '/dashboard/premios', label: '🥇 Premios', icon: '🥇', adminOnly: false },
    { href: '/dashboard/perfil', label: '👤 Perfil', icon: '👤', adminOnly: false },
    { href: '/dashboard/admin', label: '⚙️ Admin', icon: '⚙️', adminOnly: true },
  ]

  // Filtrar items basados en el rol del usuario
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return session.user?.role === 'ADMIN'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 backdrop-blur-lg bg-[#0f0c29]/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="text-4xl">⚽</span>
              <div>
                <h1 className="font-orbitron text-xl sm:text-2xl font-black gradient-text">
                  MUNDIAL 2026
                </h1>
                <p className="text-white/50 text-xs hidden sm:block">Predicciones</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-semibold">{session.user?.name}</p>
                <p className="text-white/50 text-sm">{session.user?.email}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-xl sm:text-2xl">
                {session.user?.image || '⭐'}
              </div>
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <Button type="submit" variant="secondary" size="sm">
                  Salir
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.icon}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-white/40 text-sm">
            Mundial 2026 - Predicciones © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
