# Módulo Admin: Gestión de Jugadores — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nueva pestaña admin para ver, editar y eliminar jugadores, con badge para los creados por usuarios y notificación a los usuarios afectados al eliminar.

**Architecture:** Migración Prisma aditiva (`esPersonalizado`, `createdAt`, enum `JUGADOR_ELIMINADO`) aplicada con `prisma db push`. Tres endpoints admin (`GET` lista, `PATCH` editar, `DELETE` con notificación transaccional) y una página client component protegida por rol. El endpoint de creación existente pasa a marcar `esPersonalizado: true`.

**Tech Stack:** Next.js 14 (App Router), Prisma 5 (PostgreSQL), NextAuth (`auth()` server / `useSession()` client), Tailwind, componentes `Card`/`Button`.

**Nota de verificación:** El repo no tiene framework de tests unitarios. La verificación es por `npm run build` y prueba manual end-to-end con Playwright. La BD es la de producción; los cambios de esquema son aditivos y seguros.

**Trabajo sobre la rama `main`** (autorizado por el usuario).

---

### Task 1: Migración de esquema Prisma

**Files:**
- Modify: `prisma/schema.prisma` (model `Jugador` ~líneas 190-198; enum `TipoNotificacion` ~líneas 248-253)

- [ ] **Step 1: Añadir campos a Jugador**

En `prisma/schema.prisma`, localizar el modelo `Jugador`:

```prisma
model Jugador {
  id       String  @id @default(cuid())
  nombre   String
  posicion String
  equipoId String
  foto     String?

  predicciones PrediccionPremio[]
}
```

Reemplazarlo por:

```prisma
model Jugador {
  id       String  @id @default(cuid())
  nombre   String
  posicion String
  equipoId String
  foto     String?

  esPersonalizado Boolean  @default(false)
  createdAt       DateTime @default(now())

  predicciones PrediccionPremio[]
}
```

- [ ] **Step 2: Añadir valor al enum TipoNotificacion**

Localizar:

```prisma
enum TipoNotificacion {
  PARTIDO_PROXIMO // Partido por empezar
  PUNTOS_GANADOS // Puntos obtenidos por predicción
  RESULTADO_PARTIDO // Resultado de partido publicado
  PREMIO_ACERTADO // Premio individual acertado
}
```

Reemplazar por:

```prisma
enum TipoNotificacion {
  PARTIDO_PROXIMO // Partido por empezar
  PUNTOS_GANADOS // Puntos obtenidos por predicción
  RESULTADO_PARTIDO // Resultado de partido publicado
  PREMIO_ACERTADO // Premio individual acertado
  JUGADOR_ELIMINADO // Un jugador que el usuario había elegido fue eliminado
}
```

- [ ] **Step 3: Aplicar a la BD y regenerar el cliente**

Run: `npx prisma db push`
Expected: "Your database is now in sync with your Prisma schema." y "Generated Prisma Client". Sin pérdida de datos (cambios aditivos).

- [ ] **Step 4: Verificar que el cliente compila con los nuevos campos**

Run: `npx prisma generate`
Expected: Generación exitosa.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: campos esPersonalizado/createdAt en Jugador y tipo JUGADOR_ELIMINADO"
```

---

### Task 2: Marcar como personalizados los jugadores creados desde Premios

**Files:**
- Modify: `app/api/premios/jugador/route.ts` (bloque `prisma.jugador.create`)

- [ ] **Step 1: Setear esPersonalizado en la creación**

En `app/api/premios/jugador/route.ts`, localizar:

```typescript
    const jugador = await prisma.jugador.create({
      data: { nombre, posicion, equipoId },
    })
```

Reemplazar por:

```typescript
    const jugador = await prisma.jugador.create({
      data: { nombre, posicion, equipoId, esPersonalizado: true },
    })
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: Build exitoso.

- [ ] **Step 3: Commit**

```bash
git add app/api/premios/jugador/route.ts
git commit -m "feat: marcar esPersonalizado al crear jugador desde premios"
```

---

### Task 3: Endpoint GET /api/admin/jugadores

**Files:**
- Create: `app/api/admin/jugadores/route.ts`

- [ ] **Step 1: Crear el endpoint de listado**

Crear `app/api/admin/jugadores/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const jugadores = await prisma.jugador.findMany({
      orderBy: [{ esPersonalizado: 'desc' }, { nombre: 'asc' }],
      include: { _count: { select: { predicciones: true } } },
    })

    const equipos = await prisma.equipo.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, bandera: true },
    })

    return NextResponse.json({ jugadores, equipos })
  } catch (error) {
    console.error('Error al obtener jugadores:', error)
    return NextResponse.json({ error: 'Error al obtener jugadores' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: Build exitoso. La ruta `/api/admin/jugadores` aparece en el output.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/jugadores/route.ts
git commit -m "feat: endpoint GET admin/jugadores (listado con conteo de predicciones)"
```

---

### Task 4: Endpoints PATCH y DELETE /api/admin/jugadores/[id]

**Files:**
- Create: `app/api/admin/jugadores/[id]/route.ts`

- [ ] **Step 1: Crear el endpoint con PATCH y DELETE**

Crear `app/api/admin/jugadores/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const POSICIONES_VALIDAS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      ),
    }
  }
  return { error: null }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const equipoId = typeof body.equipoId === 'string' ? body.equipoId : ''
    const posicion = body.posicion

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }
    if (nombre.length > 100) {
      return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 })
    }
    if (!equipoId) {
      return NextResponse.json({ error: 'El equipo es requerido' }, { status: 400 })
    }
    if (!POSICIONES_VALIDAS.includes(posicion)) {
      return NextResponse.json({ error: 'Posición inválida' }, { status: 400 })
    }

    const jugador = await prisma.jugador.findUnique({ where: { id: params.id } })
    if (!jugador) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 400 })
    }

    const actualizado = await prisma.jugador.update({
      where: { id: params.id },
      data: { nombre, equipoId, posicion },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error al editar jugador:', error)
    return NextResponse.json({ error: 'Error al editar jugador' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const jugador = await prisma.jugador.findUnique({ where: { id: params.id } })
    if (!jugador) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    // Predicciones que apuntan a este jugador, con el premio para el mensaje
    const predicciones = await prisma.prediccionPremio.findMany({
      where: { jugadorId: params.id },
      include: { premio: true },
    })

    const result = await prisma.$transaction(async (tx) => {
      if (predicciones.length > 0) {
        await tx.notificacion.createMany({
          data: predicciones.map((p) => ({
            userId: p.userId,
            tipo: 'JUGADOR_ELIMINADO' as const,
            titulo: '🗑️ Jugador eliminado',
            mensaje: `El jugador "${jugador.nombre}" fue eliminado. Realiza una nueva predicción en ${p.premio.nombre}.`,
          })),
        })

        await tx.prediccionPremio.deleteMany({
          where: { jugadorId: params.id },
        })
      }

      await tx.jugador.delete({ where: { id: params.id } })

      return {
        jugadorEliminado: jugador.nombre,
        prediccionesEliminadas: predicciones.length,
        usuariosNotificados: predicciones.length,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al eliminar jugador:', error)
    return NextResponse.json({ error: 'Error al eliminar jugador' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: Build exitoso. La ruta dinámica `/api/admin/jugadores/[id]` aparece en el output.

- [ ] **Step 3: Commit**

```bash
git add "app/api/admin/jugadores/[id]/route.ts"
git commit -m "feat: endpoints PATCH y DELETE admin/jugadores con notificacion al eliminar"
```

---

### Task 5: Añadir la pestaña a la navegación

**Files:**
- Modify: `app/dashboard/layout.tsx` (array `navItems`)

- [ ] **Step 1: Añadir el navItem**

En `app/dashboard/layout.tsx`, localizar:

```typescript
    { href: '/dashboard/admin', label: '⚙️ Admin', icon: '⚙️', adminOnly: true },
  ]
```

Reemplazar por:

```typescript
    { href: '/dashboard/admin', label: '⚙️ Admin', icon: '⚙️', adminOnly: true },
    { href: '/dashboard/admin/jugadores', label: '🧑 Jugadores', icon: '🧑', adminOnly: true },
  ]
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: Build exitoso.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: pestaña admin Jugadores en la navegacion"
```

---

### Task 6: Página de gestión de jugadores

**Files:**
- Create: `app/dashboard/admin/jugadores/page.tsx`

- [ ] **Step 1: Crear la página**

Crear `app/dashboard/admin/jugadores/page.tsx`:

```typescript
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

  const equipoNombre = (equipoId: string) =>
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
          {visibles.map((j) => {
            const equipo = equipoNombre(j.equipoId)
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
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: Build exitoso. La ruta `/dashboard/admin/jugadores` aparece en el output.

- [ ] **Step 3: Commit**

```bash
git add "app/dashboard/admin/jugadores/page.tsx"
git commit -m "feat: pagina admin de gestion de jugadores (listar/editar/eliminar)"
```

---

### Task 7: Verificación manual end-to-end con Playwright

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Levantar el servidor**

Run (background): `npm run dev`
Expected: Servidor en localhost (puerto 3000/3001/3002).

- [ ] **Step 2: Login como admin**

Iniciar sesión con las credenciales admin de prueba. Confirmar que en la barra de navegación aparece la pestaña "🧑 Jugadores".

- [ ] **Step 3: Verificar la lista**

Ir a `/dashboard/admin/jugadores`. Confirmar que se listan los jugadores, que los del seed NO tienen badge, y activar "Mostrar solo jugadores creados por usuarios" (debería quedar vacío o solo los personalizados si los hay).

- [ ] **Step 4: Crear y revisar un personalizado**

Desde Premios, crear un jugador personalizado. Volver al módulo y confirmar que aparece con el badge "✨ Creado por usuario" y ordenado arriba.

- [ ] **Step 5: Editar**

Editar ese jugador (cambiar nombre/equipo/posición), guardar y confirmar que el cambio persiste tras recargar.

- [ ] **Step 6: Eliminar con predicción + notificación**

Con otra cuenta, predecir usando ese jugador. Como admin, eliminarlo: confirmar el aviso del nº de predicciones, aceptar, y verificar el alert de resumen. Iniciar sesión con la cuenta afectada y confirmar que recibió la notificación "🗑️ Jugador eliminado" y que su predicción de ese premio quedó vacía.

- [ ] **Step 7: Verificar acceso restringido**

Con una cuenta no-admin, confirmar que la pestaña no aparece y que navegar a `/dashboard/admin/jugadores` redirige a `/dashboard`.

- [ ] **Step 8: Detener el servidor**

Detener el proceso `npm run dev`.

- [ ] **Step 9: Limpiar datos de prueba**

Si se crearon jugadores de prueba en la BD de producción, eliminarlos (p. ej. con `scripts/eliminar-jugadores-prueba.ts --apply` ajustando los nombres usados).
