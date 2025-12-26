'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Notificaciones from '@/components/Notificaciones'

interface NavItem {
  href: string
  label: string
  icon: string
  adminOnly: boolean
}

interface DashboardClientLayoutProps {
  userName: string
  userEmail: string
  userImage: string | null
  userRole: string
  navItems: NavItem[]
}

export default function DashboardClientLayout({
  userName,
  userEmail,
  userImage,
  userRole,
  navItems,
}: DashboardClientLayoutProps) {
  const pathname = usePathname()

  // Filtrar items basados en el rol del usuario
  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return userRole === 'ADMIN'
    }
    return true
  })

  return (
    <>
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
              {/* Notificaciones */}
              <Notificaciones />

              <div className="hidden sm:block text-right">
                <p className="text-white font-semibold">{userName}</p>
                <p className="text-white/50 text-sm">{userEmail}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-xl sm:text-2xl">
                {userImage || '⭐'}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => signOut()}
              >
                Salir
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-yellow-400 text-black'
                      : 'glass text-white hover:bg-white/10'
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.icon}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
    </>
  )
}
