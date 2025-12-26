'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Partido {
  id: string
  equipoLocal: {
    nombre: string
    bandera: string
  } | null
  equipoVisitante: {
    nombre: string
    bandera: string
  } | null
}

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  puntos: number | null
  leida: boolean
  createdAt: string
  partido: Partido | null
}

interface NotificacionesData {
  notificaciones: Notificacion[]
  noLeidas: number
}

export default function Notificaciones() {
  const router = useRouter()
  const [data, setData] = useState<NotificacionesData | null>(null)
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    fetchNotificaciones()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await fetch('/api/notificaciones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificacionId }),
      })
      await fetchNotificaciones()
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await fetch('/api/notificaciones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marcarTodasLeidas: true }),
      })
      await fetchNotificaciones()
    } catch (error) {
      console.error('Error al marcar notificaciones:', error)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'PARTIDO_PROXIMO':
        return '⏰'
      case 'PUNTOS_GANADOS':
        return '🎉'
      case 'RESULTADO_PARTIDO':
        return '📊'
      case 'PREMIO_ACERTADO':
        return '🏆'
      default:
        return '🔔'
    }
  }

  const handleNotificacionClick = (notificacion: Notificacion) => {
    marcarComoLeida(notificacion.id)

    // Navegar según el tipo de notificación
    if (notificacion.partido) {
      router.push('/dashboard/calendario')
    } else if (notificacion.tipo === 'PUNTOS_GANADOS') {
      router.push('/dashboard/predicciones')
    }

    setMostrar(false)
  }

  const formatTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date()
    const creada = new Date(fecha)
    const diferencia = ahora.getTime() - creada.getTime()

    const minutos = Math.floor(diferencia / 60000)
    const horas = Math.floor(diferencia / 3600000)
    const dias = Math.floor(diferencia / 86400000)

    if (minutos < 1) return 'Ahora'
    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    return `Hace ${dias}d`
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setMostrar(!mostrar)}
        className="relative p-2 rounded-lg glass hover:bg-white/20 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {data && data.noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {data.noLeidas > 9 ? '9+' : data.noLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMostrar(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#1a1625] border border-white/20 rounded-lg shadow-2xl z-50 max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold text-white text-lg">Notificaciones</h3>
              {data && data.noLeidas > 0 && (
                <button
                  onClick={marcarTodasLeidas}
                  className="text-xs text-yellow-400 hover:text-yellow-300"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {data?.notificaciones.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">🔕</span>
                  <p className="text-white/60">No tienes notificaciones</p>
                </div>
              ) : (
                data?.notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificacionClick(notif)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                      notif.leida
                        ? 'hover:bg-white/5'
                        : 'bg-yellow-500/10 hover:bg-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getTipoIcon(notif.tipo)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-semibold ${notif.leida ? 'text-white/80' : 'text-white'}`}>
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${notif.leida ? 'text-white/50' : 'text-white/70'}`}>
                          {notif.mensaje}
                        </p>
                        {notif.puntos !== null && (
                          <p className="text-yellow-400 font-bold text-sm mt-2">
                            +{notif.puntos} puntos
                          </p>
                        )}
                        <p className="text-xs text-white/40 mt-2">
                          {formatTiempoTranscurrido(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
