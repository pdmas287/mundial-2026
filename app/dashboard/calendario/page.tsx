'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartidoCard from '@/components/partidos/PartidoCard'
import Card from '@/components/ui/Card'

const GRUPOS = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function CalendarioPage() {
  const { data: session } = useSession()
  const [partidos, setPartidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('TODOS')

  useEffect(() => {
    fetchPartidos()
  }, [grupoSeleccionado])

  const fetchPartidos = async () => {
    try {
      setLoading(true)
      const url = grupoSeleccionado === 'TODOS'
        ? '/api/partidos'
        : `/api/partidos?grupo=${grupoSeleccionado}`

      const response = await fetch(url)
      const data = await response.json()
      setPartidos(data)
    } catch (error) {
      console.error('Error al cargar partidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async (partidoId: string, golesLocal: number, golesVisitante: number) => {
    try {
      const response = await fetch('/api/predicciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partidoId,
          golesLocal,
          golesVisitante,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar predicción')
      }

      // Refrescar partidos para mostrar la predicción actualizada
      await fetchPartidos()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al guardar predicción')
      throw error
    }
  }

  const partidosPorGrupo = partidos.reduce((acc, partido) => {
    const grupo = partido.grupo || 'Sin grupo'
    if (!acc[grupo]) {
      acc[grupo] = []
    }
    acc[grupo].push(partido)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Calendario de Partidos</h1>
        <p className="text-white/60">Fase de Grupos - Mundial 2026</p>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {GRUPOS.map((grupo) => (
            <button
              key={grupo}
              onClick={() => setGrupoSeleccionado(grupo)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                grupoSeleccionado === grupo
                  ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-black'
                  : 'glass text-white hover:bg-white/10'
              }`}
            >
              {grupo === 'TODOS' ? 'Todos los Grupos' : `Grupo ${grupo}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Estadísticas */}
      {session && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-white/60 text-sm mb-2">Predicciones Realizadas</p>
            <p className="text-4xl font-orbitron font-black gradient-text">
              {partidos.filter(p => p.predicciones?.length > 0).length}
            </p>
            <p className="text-white/40 text-xs mt-1">de {partidos.length} partidos</p>
          </Card>

          <Card className="text-center">
            <p className="text-white/60 text-sm mb-2">Partidos Pendientes</p>
            <p className="text-4xl font-orbitron font-black text-yellow-400">
              {partidos.filter(p => new Date(p.fecha) > new Date()).length}
            </p>
            <p className="text-white/40 text-xs mt-1">por jugar</p>
          </Card>

          <Card className="text-center">
            <p className="text-white/60 text-sm mb-2">Partidos Completados</p>
            <p className="text-4xl font-orbitron font-black text-green-400">
              {partidos.filter(p => p.golesLocal !== null).length}
            </p>
            <p className="text-white/40 text-xs mt-1">finalizados</p>
          </Card>
        </div>
      )}

      {/* Lista de Partidos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando partidos...</p>
        </div>
      ) : partidos.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-6xl mb-4 block">⚽</span>
          <p className="text-white/60">No hay partidos en este grupo</p>
        </Card>
      ) : grupoSeleccionado === 'TODOS' ? (
        // Mostrar agrupados por grupo
        <div className="space-y-8">
          {Object.entries(partidosPorGrupo)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([grupo, partidosGrupo]) => (
              <div key={grupo}>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Grupo {grupo}
                </h2>
                <div className="grid gap-4">
                  {partidosGrupo.map((partido) => (
                    <PartidoCard
                      key={partido.id}
                      partido={partido}
                      onPredict={session ? handlePredict : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        // Mostrar solo el grupo seleccionado
        <div className="grid gap-4">
          {partidos.map((partido) => (
            <PartidoCard
              key={partido.id}
              partido={partido}
              onPredict={session ? handlePredict : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
