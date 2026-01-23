'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import { formatDate, formatTime } from '@/lib/utils'

// Helper para verificar si es una URL o un emoji
const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/')

// Componente para mostrar bandera
const Bandera = ({ src, alt, size = 24 }: { src: string; alt: string; size?: number }) => {
  if (isUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={Math.round(size * 0.75)}
        className="rounded shadow"
      />
    )
  }
  return <span className="text-2xl">{src}</span>
}

export default function PrediccionesPage() {
  const { data: session } = useSession()
  const [predicciones, setPredicciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchPredicciones()
    }
  }, [session])

  const fetchPredicciones = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/predicciones')
      const data = await response.json()
      setPredicciones(data)
    } catch (error) {
      console.error('Error al cargar predicciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const prediccionesRealizadas = predicciones.length
  const prediccionesAcertadas = predicciones.filter(p => p.puntosObtenidos !== null && p.puntosObtenidos > 0).length
  const puntosGanados = predicciones.reduce((sum, p) => sum + (p.puntosObtenidos || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mis Predicciones</h1>
        <p className="text-white/60">Historial de todas tus predicciones</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-white/60 text-sm mb-2">Total Predicciones</p>
          <p className="text-4xl font-orbitron font-black gradient-text">
            {prediccionesRealizadas}
          </p>
        </Card>

        <Card className="text-center">
          <p className="text-white/60 text-sm mb-2">Aciertos</p>
          <p className="text-4xl font-orbitron font-black text-green-400">
            {prediccionesAcertadas}
          </p>
        </Card>

        <Card className="text-center">
          <p className="text-white/60 text-sm mb-2">Puntos Ganados</p>
          <p className="text-4xl font-orbitron font-black text-yellow-400">
            {puntosGanados}
          </p>
        </Card>

        <Card className="text-center">
          <p className="text-white/60 text-sm mb-2">Efectividad</p>
          <p className="text-4xl font-orbitron font-black text-cyan-400">
            {prediccionesRealizadas > 0
              ? Math.round((prediccionesAcertadas / prediccionesRealizadas) * 100)
              : 0}%
          </p>
        </Card>
      </div>

      {/* Lista de Predicciones */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando predicciones...</p>
        </div>
      ) : predicciones.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-6xl mb-4 block">🎯</span>
          <h3 className="text-xl font-bold text-white mb-2">
            Aún no has hecho predicciones
          </h3>
          <p className="text-white/60">
            Ve al calendario y comienza a predecir los resultados
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {predicciones.map((prediccion) => {
            const partido = prediccion.partido
            const fechaPartido = new Date(partido.fecha)
            const haTerminado = partido.golesLocal !== null
            const esCorrecto = prediccion.puntosObtenidos !== null && prediccion.puntosObtenidos > 0

            return (
              <Card key={prediccion.id} hover>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Info del partido */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bandera src={partido.equipoLocal.bandera} alt={partido.equipoLocal.nombre} />
                      <span className="font-bold text-white">{partido.equipoLocal.nombre}</span>
                      <span className="text-white/40">vs</span>
                      <span className="font-bold text-white">{partido.equipoVisitante.nombre}</span>
                      <Bandera src={partido.equipoVisitante.bandera} alt={partido.equipoVisitante.nombre} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>📅 {formatDate(fechaPartido)}</span>
                      <span>⏰ {formatTime(fechaPartido)}</span>
                      <span>📍 {partido.sede}</span>
                      <span className="glass px-2 py-1 rounded">Grupo {partido.grupo}</span>
                    </div>
                  </div>

                  {/* Predicción */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-white/50 mb-1">Tu Predicción</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-orbitron font-black text-cyan-400">
                          {prediccion.golesLocal}
                        </span>
                        <span className="text-white/40">-</span>
                        <span className="text-2xl font-orbitron font-black text-cyan-400">
                          {prediccion.golesVisitante}
                        </span>
                      </div>
                    </div>

                    {haTerminado && (
                      <div className="text-center">
                        <p className="text-xs text-white/50 mb-1">Resultado</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-orbitron font-black text-white">
                            {partido.golesLocal}
                          </span>
                          <span className="text-white/40">-</span>
                          <span className="text-2xl font-orbitron font-black text-white">
                            {partido.golesVisitante}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Puntos */}
                    <div className="text-center min-w-[100px]">
                      {haTerminado ? (
                        <>
                          <p className="text-xs text-white/50 mb-1">Puntos</p>
                          <div className={`text-3xl font-orbitron font-black ${
                            esCorrecto ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {prediccion.puntosObtenidos || 0}
                          </div>
                        </>
                      ) : (
                        <div className="glass px-3 py-1 rounded-full">
                          <span className="text-xs text-yellow-400">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
