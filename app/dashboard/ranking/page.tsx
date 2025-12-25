'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface RankingUsuario {
  posicion: number
  id: string
  nombre: string
  email: string
  avatar: string | null
  puntosTotal: number
  prediccionesRealizadas: number
  prediccionesAcertadas: number
  prediccionesParcialesAcertadas: number
  tasaAcierto: number
  puntosPorFase: Record<string, number>
  esUsuarioActual: boolean
}

interface RankingData {
  ranking: RankingUsuario[]
  usuarioActual: RankingUsuario | null
  totalUsuarios: number
}

export default function RankingPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchRanking()
  }, [search])

  const fetchRanking = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await fetch(`/api/ranking?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error al cargar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const getMedalEmoji = (posicion: number) => {
    if (posicion === 1) return '🥇'
    if (posicion === 2) return '🥈'
    if (posicion === 3) return '🥉'
    return `#${posicion}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ranking Global</h1>
          <p className="text-white/60">Tabla de posiciones de todos los usuarios</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ranking Global</h1>
          <p className="text-white/60">
            {data?.totalUsuarios || 0} participantes compitiendo
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 md:w-64 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition-colors"
          />
          <Button type="submit" size="sm">
            Buscar
          </Button>
          {search && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('')
                setSearchInput('')
              }}
            >
              Limpiar
            </Button>
          )}
        </form>
      </div>

      {/* Posición del usuario actual (si no está en top 50) */}
      {data?.usuarioActual && !data.ranking.find((u) => u.esUsuarioActual) && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-2xl">
                {data.usuarioActual.avatar || '⭐'}
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  {data.usuarioActual.nombre}
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    Tú
                  </span>
                </h3>
                <p className="text-sm text-white/60">{data.usuarioActual.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black gradient-text">
                {getMedalEmoji(data.usuarioActual.posicion)}
              </p>
              <p className="text-xl font-bold text-white">
                {data.usuarioActual.puntosTotal} pts
              </p>
              <p className="text-sm text-white/60">
                {data.usuarioActual.tasaAcierto}% acierto
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabla de Ranking */}
      <div className="grid gap-3">
        {data?.ranking.map((usuario) => (
          <Card
            key={usuario.id}
            hover
            className={
              usuario.esUsuarioActual
                ? 'border-yellow-400 bg-yellow-500/10'
                : usuario.posicion <= 3
                ? 'border-yellow-500/50'
                : ''
            }
          >
            <div className="flex items-center justify-between gap-4">
              {/* Posición y Avatar */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-center min-w-[3rem]">
                  <p
                    className={`text-2xl font-black ${
                      usuario.posicion <= 3
                        ? 'gradient-text'
                        : 'text-white/60'
                    }`}
                  >
                    {getMedalEmoji(usuario.posicion)}
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    usuario.posicion === 1
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : usuario.posicion === 2
                      ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                      : usuario.posicion === 3
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                      : 'bg-gradient-to-r from-blue-400 to-purple-500'
                  }`}
                >
                  {usuario.avatar || '⭐'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate flex items-center gap-2">
                    {usuario.nombre}
                    {usuario.esUsuarioActual && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                        Tú
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-white/60 truncate">{usuario.email}</p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Predicciones</p>
                  <p className="text-sm font-bold text-white">
                    {usuario.prediccionesRealizadas}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Exactas</p>
                  <p className="text-sm font-bold text-green-400">
                    {usuario.prediccionesAcertadas}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Parciales</p>
                  <p className="text-sm font-bold text-blue-400">
                    {usuario.prediccionesParcialesAcertadas}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">Acierto</p>
                  <p className="text-sm font-bold text-yellow-400">
                    {usuario.tasaAcierto}%
                  </p>
                </div>
              </div>

              {/* Puntos Total */}
              <div className="text-right min-w-[5rem]">
                <p className="text-2xl md:text-3xl font-black gradient-text">
                  {usuario.puntosTotal}
                </p>
                <p className="text-xs text-white/40">puntos</p>
              </div>
            </div>

            {/* Estadísticas móviles */}
            <div className="md:hidden grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-white/40 mb-1">Total</p>
                <p className="text-sm font-bold text-white">
                  {usuario.prediccionesRealizadas}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/40 mb-1">Exactas</p>
                <p className="text-sm font-bold text-green-400">
                  {usuario.prediccionesAcertadas}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/40 mb-1">Parciales</p>
                <p className="text-sm font-bold text-blue-400">
                  {usuario.prediccionesParcialesAcertadas}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/40 mb-1">Acierto</p>
                <p className="text-sm font-bold text-yellow-400">
                  {usuario.tasaAcierto}%
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {data?.ranking.length === 0 && (
        <Card className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-2xl font-bold text-white mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-white/60">
            {search
              ? `No hay usuarios que coincidan con "${search}"`
              : 'Aún no hay usuarios en el ranking'}
          </p>
        </Card>
      )}
    </div>
  )
}
