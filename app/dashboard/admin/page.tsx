'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Helper para verificar si es una URL o un emoji
const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/')

// Componente para mostrar bandera
const Bandera = ({ src, alt }: { src: string; alt: string }) => {
  if (isUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={24}
        height={18}
        className="rounded shadow"
      />
    )
  }
  return <span className="text-2xl">{src}</span>
}

const FASES = [
  { value: 'GRUPOS', label: 'Fase de Grupos' },
  { value: 'DIECISEISAVOS', label: 'Dieciseisavos de Final' },
  { value: 'OCTAVOS', label: 'Octavos de Final' },
  { value: 'CUARTOS', label: 'Cuartos de Final' },
  { value: 'SEMIFINAL', label: 'Semifinales' },
  { value: 'TERCER_PUESTO', label: 'Tercer Puesto' },
  { value: 'FINAL', label: 'Final' },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [partidos, setPartidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState(false)
  const [faseActual, setFaseActual] = useState('GRUPOS')

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      redirect('/dashboard')
    }
  }, [session, status])

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      fetchPartidos()
    }
  }, [session, faseActual])

  const fetchPartidos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partidos?fase=${faseActual}`)
      const data = await response.json()
      setPartidos(data)
    } catch (error) {
      console.error('Error al cargar partidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResult = async (
    partidoId: string,
    golesLocal: number,
    golesVisitante: number,
    tarjetas: {
      tarjetasAmarillasLocal: number
      tarjetasRojasLocal: number
      tarjetasDobleAmarillaLocal: number
      tarjetasAmarillasVisitante: number
      tarjetasRojasVisitante: number
      tarjetasDobleAmarillaVisitante: number
    },
    penales?: {
      penalesLocal: number
      penalesVisitante: number
    }
  ) => {
    try {
      setUpdating(partidoId)
      const response = await fetch(`/api/partidos/${partidoId}/resultado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          golesLocal,
          golesVisitante,
          ...tarjetas,
          ...(penales || {}),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar resultado')
      }

      const result = await response.json()
      alert(`✓ Resultado actualizado\n${result.prediccionesActualizadas} predicciones procesadas\n${result.usuariosActualizados} usuarios actualizados`)

      // Refrescar lista
      await fetchPartidos()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar resultado')
    } finally {
      setUpdating(null)
    }
  }

  const handleRecalcularTodo = async () => {
    if (!confirm('¿Estás seguro de recalcular TODOS los puntos? Esto puede tomar un momento.')) {
      return
    }

    try {
      setRecalculating(true)
      const response = await fetch('/api/admin/recalcular-puntos', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Error al recalcular puntos')
      }

      const result = await response.json()
      alert(`✓ Puntos recalculados exitosamente\n${result.partidosFinalizados} partidos procesados\n${result.prediccionesActualizadas} predicciones actualizadas\n${result.usuariosActualizados} usuarios actualizados`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al recalcular puntos')
    } finally {
      setRecalculating(false)
    }
  }

  // Mostrar loading mientras verifica permisos
  if (status === 'loading' || !session) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
        <p className="text-white/60 mt-4">Verificando permisos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-white/60">Actualizar resultados y calcular puntos</p>
        </div>

        <Button
          onClick={handleRecalcularTodo}
          disabled={recalculating}
          variant="primary"
        >
          {recalculating ? 'Recalculando...' : '🔄 Recalcular Todos los Puntos'}
        </Button>
      </div>

      {/* Warning */}
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">Nota Importante</h3>
            <p className="text-yellow-200/70 text-sm">
              Esta página es para administradores. Al actualizar un resultado, se calcularán automáticamente
              los puntos de todas las predicciones y se actualizarán los totales de los usuarios.
            </p>
          </div>
        </div>
      </Card>

      {/* Selector de Fase */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {FASES.map((fase) => (
            <button
              key={fase.value}
              onClick={() => setFaseActual(fase.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                faseActual === fase.value
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {fase.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de Partidos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando partidos...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {partidos.map((partido) => (
            <PartidoAdminCard
              key={partido.id}
              partido={partido}
              onUpdateResult={handleUpdateResult}
              updating={updating === partido.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PartidoAdminCardProps {
  partido: any
  onUpdateResult: (
    partidoId: string,
    golesLocal: number,
    golesVisitante: number,
    tarjetas: {
      tarjetasAmarillasLocal: number
      tarjetasRojasLocal: number
      tarjetasDobleAmarillaLocal: number
      tarjetasAmarillasVisitante: number
      tarjetasRojasVisitante: number
      tarjetasDobleAmarillaVisitante: number
    },
    penales?: {
      penalesLocal: number
      penalesVisitante: number
    }
  ) => void
  updating: boolean
}

function PartidoAdminCard({ partido, onUpdateResult, updating }: PartidoAdminCardProps) {
  const [golesLocal, setGolesLocal] = useState(partido.golesLocal ?? 0)
  const [golesVisitante, setGolesVisitante] = useState(partido.golesVisitante ?? 0)
  const [showTarjetas, setShowTarjetas] = useState(false)
  const [showPenales, setShowPenales] = useState(false)
  const [penalesLocal, setPenalesLocal] = useState(partido.penalesLocal ?? 0)
  const [penalesVisitante, setPenalesVisitante] = useState(partido.penalesVisitante ?? 0)

  // Tarjetas
  const [tarjetasAmarillasLocal, setTarjetasAmarillasLocal] = useState(partido.tarjetasAmarillasLocal ?? 0)
  const [tarjetasRojasLocal, setTarjetasRojasLocal] = useState(partido.tarjetasRojasLocal ?? 0)
  const [tarjetasDobleAmarillaLocal, setTarjetasDobleAmarillaLocal] = useState(partido.tarjetasDobleAmarillaLocal ?? 0)
  const [tarjetasAmarillasVisitante, setTarjetasAmarillasVisitante] = useState(partido.tarjetasAmarillasVisitante ?? 0)
  const [tarjetasRojasVisitante, setTarjetasRojasVisitante] = useState(partido.tarjetasRojasVisitante ?? 0)
  const [tarjetasDobleAmarillaVisitante, setTarjetasDobleAmarillaVisitante] = useState(partido.tarjetasDobleAmarillaVisitante ?? 0)

  const haTerminado = partido.estado === 'FINALIZADO'
  const fechaPartido = new Date(partido.fecha)
  const esEliminatoria = partido.fase !== 'GRUPOS'
  const tieneEquipos = partido.equipoLocal && partido.equipoVisitante

  // Si no tiene equipos asignados (TBD en eliminatorias)
  if (!tieneEquipos) {
    return (
      <Card className="opacity-50">
        <div className="flex items-center gap-4">
          <span className="glass px-2 py-1 rounded text-xs">
            {partido.ronda || partido.fase}
          </span>
          <span className="text-white/60">
            {fechaPartido.toLocaleDateString()} {fechaPartido.toLocaleTimeString()}
          </span>
          <span className="text-white/40">|</span>
          <span className="text-yellow-400/70">
            Equipos por definir (ejecutar scripts de clasificación)
          </span>
        </div>
      </Card>
    )
  }

  return (
    <Card hover className={haTerminado ? 'border-green-500/30' : ''}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Info del partido */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {partido.grupo ? (
              <span className="glass px-2 py-1 rounded text-xs">Grupo {partido.grupo}</span>
            ) : (
              <span className="glass px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                {partido.ronda || partido.fase}
              </span>
            )}
            <span className="text-white/40">•</span>
            <span className="text-white/60 text-sm">
              {fechaPartido.toLocaleDateString()} {fechaPartido.toLocaleTimeString()}
            </span>
            {haTerminado && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                FINALIZADO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Bandera src={partido.equipoLocal.bandera} alt={partido.equipoLocal.nombre} />
            <span className="font-bold text-white">{partido.equipoLocal.nombre}</span>
            <span className="text-white/40">vs</span>
            <span className="font-bold text-white">{partido.equipoVisitante.nombre}</span>
            <Bandera src={partido.equipoVisitante.bandera} alt={partido.equipoVisitante.nombre} />
          </div>
          <div className="mt-2 text-sm text-white/50">
            📍 {partido.sede} - {partido.estadio}
          </div>
          {partido.predicciones && partido.predicciones.length > 0 && (
            <div className="mt-2 text-xs text-cyan-400">
              {partido.predicciones.length} predicción(es) realizadas
            </div>
          )}
        </div>

        {/* Formulario de resultado */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-white/50 mb-1">Goles Local</p>
            <input
              type="number"
              min="0"
              max="20"
              value={golesLocal}
              onChange={(e) => setGolesLocal(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
              disabled={updating}
              className="w-20 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>

          <span className="text-2xl text-white/40">-</span>

          <div className="text-center">
            <p className="text-xs text-white/50 mb-1">Goles Visitante</p>
            <input
              type="number"
              min="0"
              max="20"
              value={golesVisitante}
              onChange={(e) => setGolesVisitante(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
              disabled={updating}
              className="w-20 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>

          <button
            onClick={() => setShowTarjetas(!showTarjetas)}
            className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-all"
            title="Fair Play (tarjetas)"
          >
            🟨🟥
          </button>

          {esEliminatoria && (
            <button
              onClick={() => setShowPenales(!showPenales)}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                showPenales ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
              title="Penales (si hubo empate)"
            >
              ⚽ PEN
            </button>
          )}

          <Button
            onClick={() => onUpdateResult(
              partido.id,
              golesLocal,
              golesVisitante,
              {
                tarjetasAmarillasLocal,
                tarjetasRojasLocal,
                tarjetasDobleAmarillaLocal,
                tarjetasAmarillasVisitante,
                tarjetasRojasVisitante,
                tarjetasDobleAmarillaVisitante,
              },
              esEliminatoria && golesLocal === golesVisitante
                ? { penalesLocal, penalesVisitante }
                : undefined
            )}
            disabled={updating}
            variant="primary"
            size="sm"
          >
            {updating ? 'Guardando...' : haTerminado ? 'Actualizar' : 'Finalizar Partido'}
          </Button>
        </div>
      </div>

      {/* Panel de Penales (solo eliminatorias) */}
      {showPenales && esEliminatoria && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/60 mb-3">
            ⚽ Penales (solo si terminó en empate)
          </p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">{partido.equipoLocal?.nombre}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={penalesLocal}
                onChange={(e) => setPenalesLocal(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={updating}
                className="w-16 h-10 text-center text-lg font-bold bg-blue-500/10 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <span className="text-white/40">-</span>
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">{partido.equipoVisitante?.nombre}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={penalesVisitante}
                onChange={(e) => setPenalesVisitante(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={updating}
                className="w-16 h-10 text-center text-lg font-bold bg-blue-500/10 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel de Tarjetas (Fair Play) */}
      {showTarjetas && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/60 mb-3">
            📋 Tarjetas para Fair Play (desempate en grupos)
          </p>
          <div className="grid grid-cols-2 gap-6">
            {/* Tarjetas Local */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/70">{partido.equipoLocal?.nombre}</p>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">🟨</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasAmarillasLocal}
                  onChange={(e) => setTarjetasAmarillasLocal(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Amarillas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">🟨🟨</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasDobleAmarillaLocal}
                  onChange={(e) => setTarjetasDobleAmarillaLocal(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Doble amarilla</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">🟥</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasRojasLocal}
                  onChange={(e) => setTarjetasRojasLocal(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Roja directa</span>
              </div>
            </div>

            {/* Tarjetas Visitante */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/70">{partido.equipoVisitante?.nombre}</p>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">🟨</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasAmarillasVisitante}
                  onChange={(e) => setTarjetasAmarillasVisitante(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Amarillas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">🟨🟨</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasDobleAmarillaVisitante}
                  onChange={(e) => setTarjetasDobleAmarillaVisitante(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Doble amarilla</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">🟥</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tarjetasRojasVisitante}
                  onChange={(e) => setTarjetasRojasVisitante(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={updating}
                  className="w-14 h-8 text-center text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-yellow-400"
                />
                <span className="text-xs text-white/50">Roja directa</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-3">
            Puntos Fair Play: 🟨 -1 | 🟨🟨→🟥 -3 | 🟥 directa -4
          </p>
        </div>
      )}
    </Card>
  )
}
