'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Helper para verificar si es una URL o un emoji
const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/')

// Componente para mostrar bandera
const Bandera = ({ src, alt, size = 20 }: { src: string; alt: string; size?: number }) => {
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
  return <span className="text-lg">{src}</span>
}

interface Usuario {
  id: string
  nombre: string
  email: string
  avatar: string | null
  role: string
  puntosTotal: number
  createdAt: string
}

interface Estadisticas {
  totalPredicciones: number
  prediccionesEvaluadas: number
  prediccionesExactas: number
  prediccionesParciales: number
  prediccionesFalladas: number
  tasaAcierto: number
  posicionRanking: number
  totalUsuarios: number
}

interface EstadisticaFase {
  fase: string
  predicciones: number
  aciertos: number
  puntos: number
}

interface PrediccionPremio {
  id: string
  premio: {
    nombre: string
    tipo: string
  }
  jugador: {
    nombre: string
  } | null
  equipo: {
    nombre: string
    bandera: string
  } | null
}

interface HistorialItem {
  id: string
  fecha: string
  fase: string
  equipoLocal: string
  banderaLocal: string
  equipoVisitante: string
  banderaVisitante: string
  prediccionLocal: number
  prediccionVisitante: number
  resultadoLocal: number | null
  resultadoVisitante: number | null
  puntosObtenidos: number | null
  createdAt: string
}

interface PerfilData {
  usuario: Usuario
  estadisticas: Estadisticas
  estadisticasPorFase: EstadisticaFase[]
  prediccionesPremios: PrediccionPremio[]
  historialReciente: HistorialItem[]
}

export default function PerfilPage() {
  const { data: session, update } = useSession()
  const [data, setData] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('')
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNuevo, setPasswordNuevo] = useState('')

  useEffect(() => {
    fetchPerfil()
  }, [])

  useEffect(() => {
    if (data?.usuario) {
      setNombre(data.usuario.nombre)
      setAvatar(data.usuario.avatar || '')
    }
  }, [data])

  const fetchPerfil = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/perfil')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error al cargar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    try {
      setGuardando(true)

      const body: any = { nombre, avatar }

      if (passwordNuevo) {
        if (!passwordActual) {
          alert('Debes ingresar tu contraseña actual para cambiarla')
          return
        }
        body.passwordActual = passwordActual
        body.passwordNuevo = passwordNuevo
      }

      const response = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar perfil')
      }

      // Actualizar sesión
      await update()

      // Recargar datos
      await fetchPerfil()

      // Limpiar campos de contraseña
      setPasswordActual('')
      setPasswordNuevo('')
      setEditando(false)

      alert('✓ Perfil actualizado exitosamente')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar perfil')
    } finally {
      setGuardando(false)
    }
  }

  const getFaseLabel = (fase: string) => {
    const labels: Record<string, string> = {
      GRUPOS: 'Fase de Grupos',
      OCTAVOS: 'Octavos',
      CUARTOS: 'Cuartos',
      SEMIFINAL: 'Semifinales',
      TERCER_PUESTO: 'Tercer Puesto',
      FINAL: 'Final',
    }
    return labels[fase] || fase
  }

  const getMedalEmoji = (posicion: number) => {
    if (posicion === 1) return '🥇'
    if (posicion === 2) return '🥈'
    if (posicion === 3) return '🥉'
    return `#${posicion}`
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-white/60">Gestiona tu información y estadísticas</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-white/60">Gestiona tu información y estadísticas</p>
        </div>
        {!editando && (
          <Button onClick={() => setEditando(true)}>
            ✏️ Editar Perfil
          </Button>
        )}
      </div>

      {/* Información del Usuario */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 border-yellow-500/30">
        <div className="flex items-start gap-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
              data.usuario.role === 'ADMIN'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                : 'bg-gradient-to-r from-blue-400 to-purple-500'
            }`}
          >
            {data.usuario.avatar || '⭐'}
          </div>
          <div className="flex-1">
            {editando ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 block mb-2">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">
                    Avatar (emoji)
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="⭐"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 block mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      placeholder="Solo si deseas cambiarla"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 block mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordNuevo}
                      onChange={(e) => setPasswordNuevo(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditando(false)
                      setPasswordActual('')
                      setPasswordNuevo('')
                      if (data?.usuario) {
                        setNombre(data.usuario.nombre)
                        setAvatar(data.usuario.avatar || '')
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-white mb-2">
                  {data.usuario.nombre}
                  {data.usuario.role === 'ADMIN' && (
                    <span className="ml-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                      👑 Admin
                    </span>
                  )}
                </h2>
                <p className="text-white/60 mb-4">{data.usuario.email}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Posición</p>
                    <p className="text-2xl font-black gradient-text">
                      {getMedalEmoji(data.estadisticas.posicionRanking || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Puntos Totales</p>
                    <p className="text-2xl font-black text-yellow-400">
                      {data.usuario.puntosTotal || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Miembro desde</p>
                    <p className="text-sm text-white">
                      {data.usuario.createdAt
                        ? new Date(data.usuario.createdAt).toLocaleDateString('es-ES', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-white/60 mb-2">Total Predicciones</p>
          <p className="text-4xl font-black gradient-text">
            {data.estadisticas.totalPredicciones || 0}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-white/60 mb-2">Predicciones Exactas</p>
          <p className="text-4xl font-black text-green-400">
            {data.estadisticas.prediccionesExactas || 0}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-white/60 mb-2">Predicciones Parciales</p>
          <p className="text-4xl font-black text-blue-400">
            {data.estadisticas.prediccionesParciales || 0}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-white/60 mb-2">Tasa de Acierto</p>
          <p className="text-4xl font-black text-yellow-400">
            {data.estadisticas.tasaAcierto || 0}%
          </p>
        </Card>
      </div>

      {/* Estadísticas por Fase */}
      <Card>
        <h3 className="text-2xl font-bold text-white mb-4">
          📊 Estadísticas por Fase
        </h3>
        <div className="space-y-3">
          {data.estadisticasPorFase
            .filter((f) => f.predicciones > 0)
            .map((fase) => (
              <div
                key={fase.fase}
                className="glass p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{getFaseLabel(fase.fase)}</p>
                  <p className="text-sm text-white/60">
                    {fase.predicciones} predicciones • {fase.aciertos} aciertos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-yellow-400">
                    {fase.puntos} pts
                  </p>
                  <p className="text-xs text-white/60">
                    {fase.predicciones > 0
                      ? ((fase.aciertos / fase.predicciones) * 100).toFixed(0)
                      : 0}
                    % acierto
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Predicciones de Premios */}
      {data.prediccionesPremios && data.prediccionesPremios.length > 0 && (
        <Card>
          <h3 className="text-2xl font-bold text-white mb-4">
            🏅 Mis Predicciones de Premios
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {data.prediccionesPremios.map((pred) => (
              <div key={pred.id} className="glass p-4 rounded-lg">
                <p className="text-sm text-white/60 mb-2">{pred.premio.nombre}</p>
                <p className="font-bold text-white">
                  {pred.jugador?.nombre ||
                    (pred.equipo && `${pred.equipo.bandera} ${pred.equipo.nombre}`) ||
                    'Sin predicción'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Historial Reciente */}
      <Card>
        <h3 className="text-2xl font-bold text-white mb-4">
          📜 Historial de Predicciones
        </h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {data.historialReciente.map((item) => (
            <div key={item.id} className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-white/60">
                    {getFaseLabel(item.fase)} •{' '}
                    {new Date(item.fecha).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                {item.puntosObtenidos !== null && (
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      item.puntosObtenidos >= 5
                        ? 'bg-green-500/20 text-green-400'
                        : item.puntosObtenidos > 0
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    +{item.puntosObtenidos}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Predicción */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Tu predicción:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bandera src={item.banderaLocal} alt={item.equipoLocal} />
                      <span className="text-sm text-white flex-1 truncate">
                        {item.equipoLocal}
                      </span>
                      <span className="font-bold text-white">
                        {item.prediccionLocal}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bandera src={item.banderaVisitante} alt={item.equipoVisitante} />
                      <span className="text-sm text-white flex-1 truncate">
                        {item.equipoVisitante}
                      </span>
                      <span className="font-bold text-white">
                        {item.prediccionVisitante}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Resultado:</p>
                  {item.resultadoLocal !== null && item.resultadoVisitante !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Bandera src={item.banderaLocal} alt={item.equipoLocal} />
                        <span className="text-sm text-white flex-1 truncate">
                          {item.equipoLocal}
                        </span>
                        <span className="font-bold text-white">
                          {item.resultadoLocal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bandera src={item.banderaVisitante} alt={item.equipoVisitante} />
                        <span className="text-sm text-white flex-1 truncate">
                          {item.equipoVisitante}
                        </span>
                        <span className="font-bold text-white">
                          {item.resultadoVisitante}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">Partido pendiente</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
