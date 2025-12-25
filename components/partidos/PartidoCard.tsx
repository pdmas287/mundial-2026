'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils'

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
}

interface Partido {
  id: string
  fecha: Date | string
  sede: string
  estadio: string
  grupo: string | null
  golesLocal: number | null
  golesVisitante: number | null
  equipoLocal: Equipo
  equipoVisitante: Equipo
  predicciones?: Prediccion[]
}

interface PartidoCardProps {
  partido: Partido
  onPredict?: (partidoId: string, golesLocal: number, golesVisitante: number) => Promise<void>
}

export default function PartidoCard({ partido, onPredict }: PartidoCardProps) {
  const [golesLocal, setGolesLocal] = useState<number>(
    partido.predicciones?.[0]?.golesLocal ?? 0
  )
  const [golesVisitante, setGolesVisitante] = useState<number>(
    partido.predicciones?.[0]?.golesVisitante ?? 0
  )
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const fechaPartido = typeof partido.fecha === 'string' ? new Date(partido.fecha) : partido.fecha
  const haComenzado = new Date() >= fechaPartido
  const haTerminado = partido.golesLocal !== null && partido.golesVisitante !== null
  const tienPrediccion = partido.predicciones && partido.predicciones.length > 0

  const handleSubmit = async () => {
    if (!onPredict) return

    setLoading(true)
    try {
      await onPredict(partido.id, golesLocal, golesVisitante)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error al guardar predicción:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover className="relative overflow-hidden">
      {/* Badge de grupo */}
      <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full">
        <span className="text-xs font-bold text-white/70">Grupo {partido.grupo}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Equipo Local */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 mb-4">
            <div>
              <p className="font-bold text-lg text-white">{partido.equipoLocal.nombre}</p>
              <p className="text-xs text-white/50">{partido.equipoLocal.codigo}</p>
            </div>
            <span className="text-5xl">{partido.equipoLocal.bandera}</span>
          </div>

          {!haComenzado && onPredict ? (
            <input
              type="number"
              min="0"
              max="20"
              value={golesLocal}
              onChange={(e) => setGolesLocal(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
              disabled={loading}
              className="w-20 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/30 transition-all"
            />
          ) : (
            <div className="text-4xl font-orbitron font-black text-white">
              {haTerminado ? partido.golesLocal : tienPrediccion ? golesLocal : '-'}
            </div>
          )}
        </div>

        {/* Centro - Info del partido */}
        <div className="text-center min-w-[150px]">
          <p className="font-orbitron text-xs text-white/50 mb-1">{formatDate(fechaPartido)}</p>
          <p className="font-orbitron text-2xl font-bold text-white mb-1">{formatTime(fechaPartido)}</p>
          <p className="text-xs text-white/40 mb-3">📍 {partido.sede}</p>

          {!haComenzado && onPredict ? (
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="sm"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Guardando...' : tienPrediccion ? 'Actualizar' : 'Predecir'}
            </Button>
          ) : haTerminado ? (
            <div className="glass px-3 py-1 rounded-full inline-block">
              <span className="text-xs font-bold text-green-400">FINALIZADO</span>
            </div>
          ) : haComenzado ? (
            <div className="glass px-3 py-1 rounded-full inline-block">
              <span className="text-xs font-bold text-yellow-400">EN CURSO</span>
            </div>
          ) : tienPrediccion ? (
            <div className="glass px-3 py-1 rounded-full inline-block">
              <span className="text-xs font-bold text-cyan-400">✓ Predicho</span>
            </div>
          ) : null}
        </div>

        {/* Equipo Visitante */}
        <div className="text-left">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{partido.equipoVisitante.bandera}</span>
            <div>
              <p className="font-bold text-lg text-white">{partido.equipoVisitante.nombre}</p>
              <p className="text-xs text-white/50">{partido.equipoVisitante.codigo}</p>
            </div>
          </div>

          {!haComenzado && onPredict ? (
            <input
              type="number"
              min="0"
              max="20"
              value={golesVisitante}
              onChange={(e) => setGolesVisitante(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
              disabled={loading}
              className="w-20 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/30 transition-all"
            />
          ) : (
            <div className="text-4xl font-orbitron font-black text-white">
              {haTerminado ? partido.golesVisitante : tienPrediccion ? golesVisitante : '-'}
            </div>
          )}
        </div>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in">
          <div className="glass px-6 py-3 rounded-full">
            <span className="text-green-400 font-bold">✓ Predicción guardada</span>
          </div>
        </div>
      )}

      {/* Warning si ya comenzó */}
      {haComenzado && !haTerminado && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400 text-center">
            Este partido ya comenzó. No se pueden hacer más predicciones.
          </p>
        </div>
      )}
    </Card>
  )
}
