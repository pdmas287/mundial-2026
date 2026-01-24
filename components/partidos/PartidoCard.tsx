'use client'

import { useState } from 'react'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils'

// Helper para verificar si es una URL o un emoji
const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/')

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
  penalesLocal?: number | null
  penalesVisitante?: number | null
}

interface Partido {
  id: string
  fecha: Date | string
  sede: string
  estadio: string
  grupo: string | null
  fase: string
  ronda?: string | null
  golesLocal: number | null
  golesVisitante: number | null
  penalesLocal?: number | null
  penalesVisitante?: number | null
  equipoLocal: Equipo
  equipoVisitante: Equipo
  predicciones?: Prediccion[]
}

interface PartidoCardProps {
  partido: Partido
  onPredict?: (
    partidoId: string,
    golesLocal: number,
    golesVisitante: number,
    penalesLocal?: number,
    penalesVisitante?: number
  ) => Promise<void>
}

export default function PartidoCard({ partido, onPredict }: PartidoCardProps) {
  const [golesLocal, setGolesLocal] = useState<number>(
    partido.predicciones?.[0]?.golesLocal ?? 0
  )
  const [golesVisitante, setGolesVisitante] = useState<number>(
    partido.predicciones?.[0]?.golesVisitante ?? 0
  )
  const [penalesLocal, setPenalesLocal] = useState<number>(
    partido.predicciones?.[0]?.penalesLocal ?? 4
  )
  const [penalesVisitante, setPenalesVisitante] = useState<number>(
    partido.predicciones?.[0]?.penalesVisitante ?? 3
  )
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const fechaPartido = typeof partido.fecha === 'string' ? new Date(partido.fecha) : partido.fecha
  const ahora = new Date()
  const cierrePredicciones = new Date(fechaPartido.getTime() - 60 * 60 * 1000) // 1 hora antes
  const prediccionesCerradas = ahora >= cierrePredicciones
  const haComenzado = ahora >= fechaPartido
  const haTerminado = partido.golesLocal !== null && partido.golesVisitante !== null
  const tienPrediccion = partido.predicciones && partido.predicciones.length > 0

  // Determinar si es eliminatoria y si se necesitan penales
  const esEliminatoria = partido.fase !== 'GRUPOS'
  const prediceEmpate = golesLocal === golesVisitante
  const necesitaPenales = esEliminatoria && prediceEmpate

  const handleSubmit = async () => {
    if (!onPredict) return

    // Validar que si predice empate en eliminatoria, los penales no empaten
    if (necesitaPenales && penalesLocal === penalesVisitante) {
      alert('En penales debe haber un ganador. Los penales no pueden empatar.')
      return
    }

    setLoading(true)
    try {
      await onPredict(
        partido.id,
        golesLocal,
        golesVisitante,
        necesitaPenales ? penalesLocal : undefined,
        necesitaPenales ? penalesVisitante : undefined
      )
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
      {/* Badge de grupo o fase */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${
        esEliminatoria ? 'bg-purple-500/20 border border-purple-500/30' : 'glass'
      }`}>
        <span className={`text-xs font-bold ${esEliminatoria ? 'text-purple-300' : 'text-white/70'}`}>
          {partido.grupo ? `Grupo ${partido.grupo}` : partido.ronda || partido.fase}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Equipo Local */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 mb-4">
            <div>
              <p className="font-bold text-lg text-white">{partido.equipoLocal.nombre}</p>
              <p className="text-xs text-white/50">{partido.equipoLocal.codigo}</p>
            </div>
            {isUrl(partido.equipoLocal.bandera) ? (
              <Image
                src={partido.equipoLocal.bandera}
                alt={partido.equipoLocal.nombre}
                width={48}
                height={36}
                className="rounded shadow-lg"
              />
            ) : (
              <span className="text-5xl">{partido.equipoLocal.bandera}</span>
            )}
          </div>

          {!prediccionesCerradas && onPredict ? (
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

          {!prediccionesCerradas && onPredict ? (
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
          ) : prediccionesCerradas ? (
            <div className="glass px-3 py-1 rounded-full inline-block">
              <span className="text-xs font-bold text-orange-400">CERRADO</span>
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
            {isUrl(partido.equipoVisitante.bandera) ? (
              <Image
                src={partido.equipoVisitante.bandera}
                alt={partido.equipoVisitante.nombre}
                width={48}
                height={36}
                className="rounded shadow-lg"
              />
            ) : (
              <span className="text-5xl">{partido.equipoVisitante.bandera}</span>
            )}
            <div>
              <p className="font-bold text-lg text-white">{partido.equipoVisitante.nombre}</p>
              <p className="text-xs text-white/50">{partido.equipoVisitante.codigo}</p>
            </div>
          </div>

          {!prediccionesCerradas && onPredict ? (
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

      {/* Sección de Penales (solo para eliminatorias cuando predice empate) */}
      {!prediccionesCerradas && onPredict && necesitaPenales && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center mb-3">
            ⚽ Predices empate - ¿Quién gana en penales?
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">{partido.equipoLocal.codigo}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={penalesLocal}
                onChange={(e) => setPenalesLocal(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                disabled={loading}
                className="w-14 h-10 text-center text-lg font-bold bg-blue-500/20 border border-blue-500/40 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-all"
              />
            </div>
            <span className="text-white/40 text-sm">PEN</span>
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">{partido.equipoVisitante.codigo}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={penalesVisitante}
                onChange={(e) => setPenalesVisitante(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                disabled={loading}
                className="w-14 h-10 text-center text-lg font-bold bg-blue-500/20 border border-blue-500/40 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-all"
              />
            </div>
          </div>
          {penalesLocal === penalesVisitante && (
            <p className="text-xs text-red-400 text-center mt-2">
              Los penales no pueden empatar
            </p>
          )}
        </div>
      )}

      {/* Mostrar resultado de penales si el partido terminó en empate */}
      {haTerminado && partido.golesLocal === partido.golesVisitante && partido.penalesLocal != null && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            Penales: {partido.equipoLocal.codigo} {partido.penalesLocal} - {partido.penalesVisitante} {partido.equipoVisitante.codigo}
          </p>
        </div>
      )}

      {/* Warning si predicciones cerradas pero partido no ha comenzado */}
      {prediccionesCerradas && !haComenzado && !haTerminado && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-xs text-orange-400 text-center">
            Las predicciones se cerraron 1 hora antes del partido. Ya no se pueden hacer cambios.
          </p>
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
