'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartidoCard from '@/components/partidos/PartidoCard'
import Card from '@/components/ui/Card'

const GRUPOS = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

const FASES = [
  { value: 'GRUPOS', label: 'Fase de Grupos' },
  { value: 'DIECISEISAVOS', label: 'Dieciseisavos' },
  { value: 'OCTAVOS', label: 'Octavos' },
  { value: 'CUARTOS', label: 'Cuartos' },
  { value: 'SEMIFINAL', label: 'Semifinales' },
  { value: 'FINALES', label: 'Finales' }, // Tercer puesto + Final
]

export default function CalendarioPage() {
  const { data: session } = useSession()
  const [partidos, setPartidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [faseSeleccionada, setFaseSeleccionada] = useState('GRUPOS')
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('TODOS')

  useEffect(() => {
    fetchPartidos()
  }, [faseSeleccionada, grupoSeleccionado])

  const fetchPartidos = async () => {
    try {
      setLoading(true)
      let url = '/api/partidos'

      if (faseSeleccionada === 'GRUPOS') {
        url = grupoSeleccionado === 'TODOS'
          ? '/api/partidos?fase=GRUPOS'
          : `/api/partidos?fase=GRUPOS&grupo=${grupoSeleccionado}`
      } else if (faseSeleccionada === 'FINALES') {
        // Obtener tercer puesto y final
        const [tercerPuesto, final] = await Promise.all([
          fetch('/api/partidos?fase=TERCER_PUESTO').then(r => r.json()),
          fetch('/api/partidos?fase=FINAL').then(r => r.json()),
        ])
        setPartidos([...tercerPuesto, ...final])
        setLoading(false)
        return
      } else {
        url = `/api/partidos?fase=${faseSeleccionada}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setPartidos(data)
    } catch (error) {
      console.error('Error al cargar partidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async (
    partidoId: string,
    golesLocal: number,
    golesVisitante: number,
    penalesLocal?: number,
    penalesVisitante?: number
  ) => {
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
          penalesLocal,
          penalesVisitante,
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
        <p className="text-white/60">
          {faseSeleccionada === 'GRUPOS' ? 'Fase de Grupos' : FASES.find(f => f.value === faseSeleccionada)?.label} - Mundial 2026
        </p>
      </div>

      {/* Selector de Fase */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {FASES.map((fase) => (
            <button
              key={fase.value}
              onClick={() => {
                setFaseSeleccionada(fase.value)
                if (fase.value !== 'GRUPOS') setGrupoSeleccionado('TODOS')
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                faseSeleccionada === fase.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              {fase.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Filtros de Grupo (solo para fase de grupos) */}
      {faseSeleccionada === 'GRUPOS' && (
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
                {grupo === 'TODOS' ? 'Todos' : grupo}
              </button>
            ))}
          </div>
        </Card>
      )}

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
          <p className="text-white/60">
            {faseSeleccionada === 'GRUPOS' ? 'No hay partidos en este grupo' : 'No hay partidos en esta fase'}
          </p>
        </Card>
      ) : faseSeleccionada === 'GRUPOS' && grupoSeleccionado === 'TODOS' ? (
        // Mostrar agrupados por grupo
        <div className="space-y-8">
          {Object.entries(partidosPorGrupo)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([grupo, partidosGrupo]: [string, any[]]) => (
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
        // Mostrar partidos (eliminatorias o grupo específico)
        <div className="grid gap-4">
          {partidos.map((partido) => {
            // Si el partido no tiene equipos asignados (TBD)
            if (!partido.equipoLocal || !partido.equipoVisitante) {
              return (
                <Card key={partido.id} className="opacity-50">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <span className="glass px-3 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                        {partido.ronda || partido.fase}
                      </span>
                      <span className="text-white/60 text-sm">
                        {new Date(partido.fecha).toLocaleDateString()} {new Date(partido.fecha).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-yellow-400/70 text-sm">
                      Equipos por definir
                    </span>
                  </div>
                </Card>
              )
            }

            return (
              <PartidoCard
                key={partido.id}
                partido={partido}
                onPredict={session ? handlePredict : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
