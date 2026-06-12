'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/')

const Bandera = ({ src, alt }: { src: string; alt: string }) => {
  if (isUrl(src)) {
    return <Image src={src} alt={alt} width={24} height={18} className="rounded shadow" />
  }
  return <span className="text-2xl">{src}</span>
}

const POSICIONES = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

interface Equipo {
  id: string
  nombre: string
  bandera: string
}

interface Jugador {
  id: string
  nombre: string
  posicion: string
  equipoId: string
  esPersonalizado: boolean
  createdAt: string
  _count: { predicciones: number }
}

export default function AdminJugadoresPage() {
  const { data: session, status } = useSession()
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [soloPersonalizados, setSoloPersonalizados] = useState(false)

  // Edición inline
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editEquipoId, setEditEquipoId] = useState('')
  const [editPosicion, setEditPosicion] = useState('Delantero')
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')
  }, [session, status])

  useEffect(() => {
    if (session?.user.role === 'ADMIN') fetchJugadores()
  }, [session])

  const fetchJugadores = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/jugadores')
      if (!res.ok) throw new Error('Error al cargar jugadores')
      const data = await res.json()
      setJugadores(data.jugadores)
      setEquipos(data.equipos)
    } catch (error) {
      console.error('Error al cargar jugadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEquipo = (equipoId: string) =>
    equipos.find((e) => e.id === equipoId)

  const iniciarEdicion = (j: Jugador) => {
    setEditandoId(j.id)
    setEditNombre(j.nombre)
    setEditEquipoId(j.equipoId)
    setEditPosicion(j.posicion)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditNombre('')
    setEditEquipoId('')
    setEditPosicion('Delantero')
  }

  const guardarEdicion = async (id: string) => {
    if (!editNombre.trim()) { alert('Ingresa el nombre del jugador'); return }
    if (!editEquipoId) { alert('Selecciona un equipo'); return }
    try {
      setGuardando(true)
      const res = await fetch(`/api/admin/jugadores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          equipoId: editEquipoId,
          posicion: editPosicion,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al editar jugador')
      cancelarEdicion()
      await fetchJugadores()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al editar jugador')
    } finally {
      setGuardando(false)
    }
  }

  const eliminarJugador = async (j: Jugador) => {
    const aviso =
      j._count.predicciones > 0
        ? `Este jugador tiene ${j._count.predicciones} predicción(es) de usuarios. Al eliminarlo se borrarán esas predicciones y se notificará a esos usuarios. ¿Continuar?`
        : `¿Eliminar a "${j.nombre}"?`
    if (!confirm(aviso)) return
    try {
      setEliminando(j.id)
      const res = await fetch(`/api/admin/jugadores/${j.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar jugador')
      alert(
        `✓ Jugador "${data.jugadorEliminado}" eliminado.\n` +
        `${data.prediccionesEliminadas} predicción(es) borrada(s).\n` +
        `${data.usuariosNotificados} usuario(s) notificado(s).`
      )
      await fetchJugadores()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al eliminar jugador')
    } finally {
      setEliminando(null)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
        <p className="text-white/60 mt-4">Verificando permisos...</p>
      </div>
    )
  }

  const visibles = soloPersonalizados
    ? jugadores.filter((j) => j.esPersonalizado)
    : jugadores

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Jugadores</h1>
        <p className="text-white/60">
          Revisa, edita o elimina los jugadores. Los creados por usuarios aparecen marcados.
        </p>
      </div>

      <Card>
        <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={soloPersonalizados}
            onChange={(e) => setSoloPersonalizados(e.target.checked)}
          />
          Mostrar solo jugadores creados por usuarios
        </label>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
          <p className="text-white/60 mt-4">Cargando jugadores...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-white/40 text-sm">{visibles.length} jugador(es)</p>
          {visibles.length === 0 && (
            <p className="text-white/40 text-sm text-center py-8">
              {soloPersonalizados
                ? 'No hay jugadores creados por usuarios.'
                : 'No hay jugadores.'}
            </p>
          )}
          {visibles.map((j) => {
            const equipo = getEquipo(j.equipoId)
            const enEdicion = editandoId === j.id
            return (
              <Card key={j.id} className={j.esPersonalizado ? 'border-purple-500/30' : ''}>
                {enEdicion ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      placeholder="Nombre del jugador"
                      className="w-full glass p-2 rounded-lg bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-yellow-400 outline-none"
                    />
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={editEquipoId}
                        onChange={(e) => setEditEquipoId(e.target.value)}
                        className="glass p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-yellow-400 outline-none"
                      >
                        <option value="" className="bg-gray-800">Selecciona un equipo</option>
                        {equipos.map((e) => (
                          <option key={e.id} value={e.id} className="bg-gray-800">{e.nombre}</option>
                        ))}
                      </select>
                      <select
                        value={editPosicion}
                        onChange={(e) => setEditPosicion(e.target.value)}
                        className="glass p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-yellow-400 outline-none"
                      >
                        {POSICIONES.map((p) => (
                          <option key={p} value={p} className="bg-gray-800">{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => guardarEdicion(j.id)} disabled={guardando} size="sm">
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button variant="secondary" onClick={cancelarEdicion} disabled={guardando} size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {equipo && <Bandera src={equipo.bandera} alt={equipo.nombre} />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{j.nombre}</p>
                          {j.esPersonalizado && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                              ✨ Creado por usuario
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60">
                          {j.posicion}{equipo ? ` · ${equipo.nombre}` : ''} · {j._count.predicciones} predicción(es)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => iniciarEdicion(j)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarJugador(j)}
                        disabled={eliminando === j.id}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        {eliminando === j.id ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
