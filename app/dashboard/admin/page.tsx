'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminPage() {
  const { data: session } = useSession()
  const [partidos, setPartidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    fetchPartidos()
  }, [])

  const fetchPartidos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partidos')
      const data = await response.json()
      setPartidos(data)
    } catch (error) {
      console.error('Error al cargar partidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResult = async (partidoId: string, golesLocal: number, golesVisitante: number) => {
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
  onUpdateResult: (partidoId: string, golesLocal: number, golesVisitante: number) => void
  updating: boolean
}

function PartidoAdminCard({ partido, onUpdateResult, updating }: PartidoAdminCardProps) {
  const [golesLocal, setGolesLocal] = useState(partido.golesLocal ?? 0)
  const [golesVisitante, setGolesVisitante] = useState(partido.golesVisitante ?? 0)

  const haTerminado = partido.estado === 'FINALIZADO'
  const fechaPartido = new Date(partido.fecha)

  return (
    <Card hover className={haTerminado ? 'border-green-500/30' : ''}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Info del partido */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="glass px-2 py-1 rounded text-xs">Grupo {partido.grupo}</span>
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
            <span className="text-2xl">{partido.equipoLocal.bandera}</span>
            <span className="font-bold text-white">{partido.equipoLocal.nombre}</span>
            <span className="text-white/40">vs</span>
            <span className="font-bold text-white">{partido.equipoVisitante.nombre}</span>
            <span className="text-2xl">{partido.equipoVisitante.bandera}</span>
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

          <Button
            onClick={() => onUpdateResult(partido.id, golesLocal, golesVisitante)}
            disabled={updating}
            variant="primary"
            size="sm"
          >
            {updating ? 'Guardando...' : haTerminado ? 'Actualizar' : 'Finalizar Partido'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
