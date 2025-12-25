'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Premio {
  id: string
  tipo: string
  nombre: string
  descripcion: string
  puntos: number
}

interface Jugador {
  id: string
  nombre: string
  posicion: string
  equipoId: string
  foto: string | null
}

interface Equipo {
  id: string
  nombre: string
  codigo: string
  bandera: string
  grupo: string
}

interface PrediccionPremio {
  id: string
  premioId: string
  jugadorId: string | null
  equipoId: string | null
  jugador: Jugador | null
}

interface PremiosData {
  premios: Premio[]
  predicciones: PrediccionPremio[]
  jugadores: Jugador[]
  equipos: Equipo[]
}

export default function PremiosPage() {
  const [data, setData] = useState<PremiosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchPremios()
  }, [])

  const fetchPremios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/premios')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error al cargar premios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrediccion = async (premioId: string, jugadorId?: string, equipoId?: string) => {
    try {
      setSaving(premioId)

      const response = await fetch('/api/premios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          premioId,
          jugadorId,
          equipoId,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar predicción')
      }

      // Recargar datos
      await fetchPremios()
      alert('✓ Predicción guardada exitosamente')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al guardar predicción')
    } finally {
      setSaving(null)
    }
  }

  const getPrediccion = (premioId: string) => {
    return data?.predicciones.find((p) => p.premioId === premioId)
  }

  const getPremioIcon = (tipo: string) => {
    switch (tipo) {
      case 'BALON_ORO':
        return '⚽'
      case 'BOTA_ORO':
        return '👟'
      case 'GUANTE_ORO':
        return '🧤'
      case 'CAMPEON':
        return '🏆'
      case 'SUBCAMPEON':
        return '🥈'
      default:
        return '🏅'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Premios Individuales</h1>
          <p className="text-white/60">Predice los ganadores de los premios del Mundial</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando premios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Premios Individuales</h1>
        <p className="text-white/60">
          Predice los ganadores y gana {data?.premios[0]?.puntos || 10} puntos extra por cada acierto
        </p>
      </div>

      {/* Lista de Premios */}
      <div className="grid gap-6">
        {data?.premios.map((premio) => {
          const prediccion = getPrediccion(premio.id)
          const esJugador = ['BALON_ORO', 'BOTA_ORO', 'GUANTE_ORO'].includes(premio.tipo)
          const esEquipo = ['CAMPEON', 'SUBCAMPEON'].includes(premio.tipo)

          return (
            <Card key={premio.id} className="overflow-hidden">
              <div className="space-y-4">
                {/* Header del Premio */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">{getPremioIcon(premio.tipo)}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{premio.nombre}</h3>
                      <p className="text-white/60 text-sm">{premio.descripcion}</p>
                      <p className="mt-2 text-yellow-400 font-bold">
                        +{premio.puntos} puntos por acierto
                      </p>
                    </div>
                  </div>
                </div>

                {/* Predicción Actual */}
                {prediccion && (
                  <div className="glass p-4 rounded-lg">
                    <p className="text-xs text-white/40 mb-2">Tu predicción:</p>
                    <div className="flex items-center gap-3">
                      {esJugador && prediccion.jugador && (
                        <>
                          <span className="text-3xl">⭐</span>
                          <div>
                            <p className="font-bold text-white">{prediccion.jugador.nombre}</p>
                            <p className="text-sm text-white/60">{prediccion.jugador.posicion}</p>
                          </div>
                        </>
                      )}
                      {esEquipo && prediccion.equipoId && (
                        <>
                          <span className="text-3xl">
                            {data.equipos.find((e) => e.id === prediccion.equipoId)?.bandera}
                          </span>
                          <p className="font-bold text-white">
                            {data.equipos.find((e) => e.id === prediccion.equipoId)?.nombre}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Selector */}
                <div>
                  {esJugador && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white/80">
                        Selecciona un jugador:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {data?.jugadores
                          .filter((j) => {
                            // Filtrar por posición según el premio
                            if (premio.tipo === 'GUANTE_ORO') return j.posicion === 'Portero'
                            if (premio.tipo === 'BOTA_ORO') return j.posicion === 'Delantero'
                            return true // BALON_ORO: todos
                          })
                          .map((jugador) => (
                            <button
                              key={jugador.id}
                              onClick={() => handleSavePrediccion(premio.id, jugador.id)}
                              disabled={saving === premio.id}
                              className={`glass p-3 rounded-lg text-left hover:bg-white/20 transition-all ${
                                prediccion?.jugadorId === jugador.id
                                  ? 'border-2 border-yellow-400 bg-yellow-500/10'
                                  : 'border border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-white truncate">
                                    {jugador.nombre}
                                  </p>
                                  <p className="text-xs text-white/60">{jugador.posicion}</p>
                                </div>
                                {prediccion?.jugadorId === jugador.id && (
                                  <span className="text-yellow-400">✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {esEquipo && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white/80">
                        Selecciona un equipo:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {data?.equipos.map((equipo) => (
                          <button
                            key={equipo.id}
                            onClick={() => handleSavePrediccion(premio.id, undefined, equipo.id)}
                            disabled={saving === premio.id}
                            className={`glass p-4 rounded-lg text-center hover:bg-white/20 transition-all ${
                              prediccion?.equipoId === equipo.id
                                ? 'border-2 border-yellow-400 bg-yellow-500/10'
                                : 'border border-white/10'
                            }`}
                          >
                            <span className="text-4xl block mb-2">{equipo.bandera}</span>
                            <p className="font-semibold text-white text-sm">{equipo.nombre}</p>
                            {prediccion?.equipoId === equipo.id && (
                              <span className="text-yellow-400 mt-2 block">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Info */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-400 mb-1">Información</h3>
            <ul className="text-blue-200/70 text-sm space-y-1">
              <li>• Puedes cambiar tus predicciones hasta que comience el torneo</li>
              <li>• Ganarás puntos extra si aciertas el ganador de cada premio</li>
              <li>• Los ganadores se anunciarán al finalizar el Mundial 2026</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
