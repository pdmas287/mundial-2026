'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Equipo {
  id: string
  nombre: string
  codigo: string
  bandera: string
  grupo: string
}

interface Prediccion {
  id: string
  golesLocal: number
  golesVisitante: number
  puntosObtenidos: number | null
}

interface Partido {
  id: string
  fase: string
  fecha: string
  hora: string
  sede: string
  golesLocal: number | null
  golesVisitante: number | null
  equipoLocal: Equipo | null
  equipoVisitante: Equipo | null
  predicciones: Prediccion[]
}

interface BracketsData {
  brackets: {
    OCTAVOS: Partido[]
    CUARTOS: Partido[]
    SEMIFINAL: Partido[]
    TERCER_PUESTO: Partido[]
    FINAL: Partido[]
  }
  estadisticas: {
    totalPredicciones: number
    prediccionesAcertadas: number
    puntosEliminatorias: number
  }
}

export default function BracketsPage() {
  const router = useRouter()
  const [data, setData] = useState<BracketsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [faseActiva, setFaseActiva] = useState<
    'OCTAVOS' | 'CUARTOS' | 'SEMIFINAL' | 'TERCER_PUESTO' | 'FINAL'
  >('OCTAVOS')

  useEffect(() => {
    fetchBrackets()
  }, [])

  const fetchBrackets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brackets')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error al cargar brackets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFaseLabel = (fase: string) => {
    const labels: Record<string, string> = {
      OCTAVOS: 'Octavos de Final',
      CUARTOS: 'Cuartos de Final',
      SEMIFINAL: 'Semifinales',
      TERCER_PUESTO: 'Tercer Puesto',
      FINAL: 'Final',
    }
    return labels[fase] || fase
  }

  const getFaseIcon = (fase: string) => {
    const icons: Record<string, string> = {
      OCTAVOS: '⚽',
      CUARTOS: '🔥',
      SEMIFINAL: '⭐',
      TERCER_PUESTO: '🥉',
      FINAL: '🏆',
    }
    return icons[fase] || '⚽'
  }

  const handlePredecir = (partidoId: string) => {
    router.push(`/dashboard/calendario?partido=${partidoId}`)
  }

  const renderPartido = (partido: Partido) => {
    const prediccion = partido.predicciones[0]
    const equiposDefinidos = partido.equipoLocal && partido.equipoVisitante

    return (
      <Card key={partido.id} className="overflow-hidden">
        <div className="space-y-4">
          {/* Header del Partido */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">
                {new Date(partido.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="text-xs text-white/40">
                {partido.hora} • {partido.sede}
              </p>
            </div>
            <span className="text-3xl">{getFaseIcon(partido.fase)}</span>
          </div>

          {/* Equipos y Resultado */}
          {equiposDefinidos ? (
            <div className="space-y-3">
              {/* Equipo Local */}
              <div className="flex items-center justify-between glass p-4 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-4xl">{partido.equipoLocal!.bandera}</span>
                  <div>
                    <p className="font-bold text-white text-lg">
                      {partido.equipoLocal!.nombre}
                    </p>
                    <p className="text-xs text-white/60">{partido.equipoLocal!.codigo}</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white min-w-[3rem] text-center">
                  {partido.golesLocal !== null ? partido.golesLocal : '-'}
                </div>
              </div>

              {/* Equipo Visitante */}
              <div className="flex items-center justify-between glass p-4 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-4xl">{partido.equipoVisitante!.bandera}</span>
                  <div>
                    <p className="font-bold text-white text-lg">
                      {partido.equipoVisitante!.nombre}
                    </p>
                    <p className="text-xs text-white/60">
                      {partido.equipoVisitante!.codigo}
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white min-w-[3rem] text-center">
                  {partido.golesVisitante !== null ? partido.golesVisitante : '-'}
                </div>
              </div>

              {/* Predicción */}
              {prediccion ? (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-300 mb-1">Tu predicción:</p>
                      <p className="text-xl font-bold text-white">
                        {prediccion.golesLocal} - {prediccion.golesVisitante}
                      </p>
                    </div>
                    {prediccion.puntosObtenidos !== null && (
                      <div className="text-right">
                        <p className="text-xs text-white/60 mb-1">Puntos obtenidos:</p>
                        <p
                          className={`text-2xl font-black ${
                            prediccion.puntosObtenidos >= 5
                              ? 'text-green-400'
                              : prediccion.puntosObtenidos > 0
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          +{prediccion.puntosObtenidos}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button onClick={() => handlePredecir(partido.id)} className="w-full">
                  Hacer Predicción
                </Button>
              )}
            </div>
          ) : (
            <div className="glass p-8 rounded-lg text-center">
              <span className="text-5xl block mb-3">❓</span>
              <p className="text-white/60">
                Los equipos se definirán después de la fase de grupos
              </p>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Brackets de Eliminatorias</h1>
          <p className="text-white/60">Visualiza y predice los partidos eliminatorios</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando brackets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Brackets de Eliminatorias</h1>
        <p className="text-white/60">Visualiza y predice los partidos eliminatorios</p>
      </div>

      {/* Estadísticas */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 border-yellow-500/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Predicciones</p>
            <p className="text-2xl font-black gradient-text">
              {data?.estadisticas.totalPredicciones || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Acertadas</p>
            <p className="text-2xl font-black text-green-400">
              {data?.estadisticas.prediccionesAcertadas || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Puntos</p>
            <p className="text-2xl font-black text-yellow-400">
              {data?.estadisticas.puntosEliminatorias || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Selector de Fase */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL'] as const).map(
          (fase) => (
            <button
              key={fase}
              onClick={() => setFaseActiva(fase)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                faseActiva === fase
                  ? 'bg-yellow-400 text-black'
                  : 'glass text-white hover:bg-white/20'
              }`}
            >
              {getFaseIcon(fase)} {getFaseLabel(fase)}
            </button>
          )
        )}
      </div>

      {/* Lista de Partidos */}
      <div className="grid gap-4">
        {data?.brackets[faseActiva].length === 0 ? (
          <Card className="text-center py-12">
            <span className="text-6xl mb-4 block">{getFaseIcon(faseActiva)}</span>
            <h3 className="text-2xl font-bold text-white mb-2">
              {getFaseLabel(faseActiva)}
            </h3>
            <p className="text-white/60">
              Los partidos de esta fase aún no están disponibles
            </p>
          </Card>
        ) : (
          data?.brackets[faseActiva].map((partido) => renderPartido(partido))
        )}
      </div>

      {/* Información */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-400 mb-1">Información</h3>
            <ul className="text-blue-200/70 text-sm space-y-1">
              <li>• Los equipos se definen al finalizar la fase de grupos</li>
              <li>• Puedes predecir los resultados antes de que comience cada partido</li>
              <li>• En eliminatorias, los puntos tienen mayor valor</li>
              <li>• Las predicciones se cierran al inicio del partido</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
