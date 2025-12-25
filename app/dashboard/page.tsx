import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'
import Button from '@/components/ui/Button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚽</span>
            <div>
              <h1 className="font-orbitron text-2xl font-black gradient-text">
                MUNDIAL 2026
              </h1>
              <p className="text-white/50 text-sm">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-semibold">{session.user?.name}</p>
              <p className="text-white/50 text-sm">{session.user?.email}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-2xl">
              {session.user?.image || '⭐'}
            </div>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Bienvenido, {session.user?.name}! 👋
          </h2>
          <p className="text-white/70 mb-8">
            Has iniciado sesión exitosamente. El dashboard completo estará disponible pronto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass rounded-xl p-6">
              <span className="text-4xl mb-2 block">📅</span>
              <h3 className="text-xl font-bold text-white mb-2">Calendario</h3>
              <p className="text-white/60 text-sm">Próximamente</p>
            </div>

            <div className="glass rounded-xl p-6">
              <span className="text-4xl mb-2 block">🎯</span>
              <h3 className="text-xl font-bold text-white mb-2">Predicciones</h3>
              <p className="text-white/60 text-sm">Próximamente</p>
            </div>

            <div className="glass rounded-xl p-6">
              <span className="text-4xl mb-2 block">🏆</span>
              <h3 className="text-xl font-bold text-white mb-2">Ranking</h3>
              <p className="text-white/60 text-sm">Próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
