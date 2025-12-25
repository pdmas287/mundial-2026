import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          ¡Bienvenido, {session.user?.name}! 👋
        </h1>
        <p className="text-white/60">
          Comienza a hacer tus predicciones para el Mundial 2026
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/calendario">
          <Card hover className="text-center cursor-pointer h-full">
            <span className="text-5xl mb-3 block">📅</span>
            <h3 className="text-xl font-bold text-white mb-2">Calendario</h3>
            <p className="text-white/60 text-sm">Ver partidos y hacer predicciones</p>
          </Card>
        </Link>

        <Link href="/dashboard/predicciones">
          <Card hover className="text-center cursor-pointer h-full">
            <span className="text-5xl mb-3 block">🎯</span>
            <h3 className="text-xl font-bold text-white mb-2">Mis Predicciones</h3>
            <p className="text-white/60 text-sm">Revisa tus pronósticos</p>
          </Card>
        </Link>

        <Link href="/dashboard/ranking">
          <Card hover className="text-center cursor-pointer h-full">
            <span className="text-5xl mb-3 block">🏆</span>
            <h3 className="text-xl font-bold text-white mb-2">Ranking</h3>
            <p className="text-white/60 text-sm">Ve tu posición global</p>
          </Card>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">🎮 Cómo Jugar</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">1.</span>
              <span>Ve al calendario y selecciona los partidos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">2.</span>
              <span>Predice el resultado ingresando los goles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">3.</span>
              <span>Guarda tus predicciones antes que empiece el partido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">4.</span>
              <span>Gana puntos por cada acierto y sube en el ranking</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white mb-4">🏅 Sistema de Puntos</h3>
          <div className="space-y-3 text-white/70">
            <div className="flex justify-between items-center">
              <span>Resultado exacto</span>
              <span className="font-bold text-green-400">5 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Goles de un equipo</span>
              <span className="font-bold text-cyan-400">2 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ganador/Empate</span>
              <span className="font-bold text-yellow-400">1 pt</span>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-sm text-white/50">
                Los puntos se multiplican según la fase del torneo (hasta x3 en la final)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
