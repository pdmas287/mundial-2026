import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardClientLayout from '@/components/DashboardClientLayout'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <DashboardClientLayout
        userName={session.user?.name || ''}
        userEmail={session.user?.email || ''}
        userImage={session.user?.image || null}
        userRole={session.user?.role || 'USER'}
        navItems={navItems}
      />

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
