# Jugador personalizado en Premios — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que cualquier usuario agregue al catálogo un jugador que no está entre los elegibles para los premios Balón, Bota y Guante de Oro, y que quede auto-seleccionado como su predicción.

**Architecture:** Nuevo endpoint `POST /api/premios/jugador` que crea (idempotente) un `Jugador` real en la BD. El frontend de premios añade un formulario inline por premio de jugador para introducir nombre + equipo + posición (Guante fuerza Portero). Se elimina el filtro de posición de Bota de Oro; se conserva el de Guante.

**Tech Stack:** Next.js 14 (App Router), React (client component), Prisma 5, NextAuth (`auth()`), Tailwind.

**Nota de verificación:** El repo no tiene framework de tests unitarios. La verificación es por `npm run build` / `npm run lint` y prueba manual end-to-end con Playwright usando las credenciales de prueba (`josbelmillan@gmail.com` / `Supermario64`).

---

### Task 1: Endpoint para crear jugador personalizado

**Files:**
- Create: `app/api/premios/jugador/route.ts`

- [ ] **Step 1: Crear el endpoint**

Crear `app/api/premios/jugador/route.ts` con el siguiente contenido:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const POSICIONES_VALIDAS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const equipoId = body.equipoId
    const posicion = body.posicion

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    if (!POSICIONES_VALIDAS.includes(posicion)) {
      return NextResponse.json({ error: 'Posición inválida' }, { status: 400 })
    }

    const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 400 })
    }

    // Idempotencia: si ya existe un jugador con mismo nombre (case-insensitive)
    // y mismo equipo, devolverlo en lugar de duplicar.
    const existente = await prisma.jugador.findFirst({
      where: {
        equipoId,
        nombre: { equals: nombre, mode: 'insensitive' },
      },
    })

    if (existente) {
      return NextResponse.json(existente, { status: 200 })
    }

    const jugador = await prisma.jugador.create({
      data: { nombre, posicion, equipoId },
    })

    return NextResponse.json(jugador, { status: 201 })
  } catch (error) {
    console.error('Error al crear jugador personalizado:', error)
    return NextResponse.json({ error: 'Error al crear jugador' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: Build exitoso, sin errores de tipos.

> **Nota provider:** Verificado — el datasource es `postgresql`, por lo que `mode: 'insensitive'` es válido.

- [ ] **Step 3: Commit**

```bash
git add app/api/premios/jugador/route.ts
git commit -m "feat: endpoint para crear jugador personalizado en premios"
```

---

### Task 2: Ajustar filtro de posición en el frontend

**Files:**
- Modify: `app/dashboard/premios/page.tsx` (bloque del `.filter()` en la lista de elegibles, ~líneas 226-232)

- [ ] **Step 1: Reemplazar el filtro**

En `app/dashboard/premios/page.tsx`, localizar este bloque dentro del render del selector de jugador:

```typescript
                        {data?.jugadores
                          .filter((j) => {
                            // Filtrar por posición según el premio
                            if (premio.tipo === 'GUANTE_ORO') return j.posicion === 'Portero'
                            if (premio.tipo === 'BOTA_ORO') return j.posicion === 'Delantero'
                            return true // BALON_ORO: todos
                          })
                          .map((jugador) => (
```

Reemplazarlo por (solo Guante de Oro filtra por Portero; Bota y Balón muestran todos):

```typescript
                        {data?.jugadores
                          .filter((j) => {
                            // Solo el Guante de Oro restringe a porteros
                            if (premio.tipo === 'GUANTE_ORO') return j.posicion === 'Portero'
                            return true // BALON_ORO y BOTA_ORO: todos
                          })
                          .map((jugador) => (
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: Build exitoso.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/premios/page.tsx
git commit -m "feat: bota de oro muestra todos los jugadores, guante solo porteros"
```

---

### Task 3: Estado del formulario inline en el frontend

**Files:**
- Modify: `app/dashboard/premios/page.tsx` (sección de estado del componente, ~líneas 66-69)

- [ ] **Step 1: Añadir estado para el formulario de nuevo jugador**

En `app/dashboard/premios/page.tsx`, localizar:

```typescript
export default function PremiosPage() {
  const [data, setData] = useState<PremiosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
```

Añadir debajo el estado del formulario:

```typescript
  // Formulario para agregar un jugador personalizado (por premio)
  const [agregandoPara, setAgregandoPara] = useState<string | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoEquipoId, setNuevoEquipoId] = useState('')
  const [nuevaPosicion, setNuevaPosicion] = useState('Delantero')
  const [creando, setCreando] = useState(false)
```

- [ ] **Step 2: Añadir el handler de creación**

En el mismo archivo, después de la función `handleSavePrediccion` (que termina ~línea 117), añadir:

```typescript
  const resetFormulario = () => {
    setAgregandoPara(null)
    setNuevoNombre('')
    setNuevoEquipoId('')
    setNuevaPosicion('Delantero')
  }

  const handleCrearJugador = async (premioId: string, tipo: string) => {
    if (!nuevoNombre.trim()) {
      alert('Ingresa el nombre del jugador')
      return
    }
    if (!nuevoEquipoId) {
      alert('Selecciona un equipo')
      return
    }

    // Guante de Oro fuerza Portero; el resto usa la posición elegida
    const posicion = tipo === 'GUANTE_ORO' ? 'Portero' : nuevaPosicion

    try {
      setCreando(true)
      const response = await fetch('/api/premios/jugador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          equipoId: nuevoEquipoId,
          posicion,
        }),
      })

      const jugador = await response.json()
      if (!response.ok) {
        throw new Error(jugador.error || 'Error al crear jugador')
      }

      resetFormulario()
      // Auto-seleccionar el jugador recién creado como predicción de este premio
      await handleSavePrediccion(premioId, jugador.id)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al crear jugador')
    } finally {
      setCreando(false)
    }
  }
```

- [ ] **Step 3: Verificar que compila**

Run: `npm run build`
Expected: Build exitoso. (`handleCrearJugador` aún no se usa en el JSX; eso es Task 4. Si el linter marca "unused", se resuelve al añadir el UI en Task 4 — se puede commitear igualmente porque `next build` no falla por variables sin usar.)

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/premios/page.tsx
git commit -m "feat: estado y handler para crear jugador personalizado"
```

---

### Task 4: Formulario inline en el UI del premio

**Files:**
- Modify: `app/dashboard/premios/page.tsx` (dentro del bloque `esJugador`, después del grid de jugadores, ~línea 258)

- [ ] **Step 1: Añadir el botón y formulario inline**

En `app/dashboard/premios/page.tsx`, localizar el cierre del grid de jugadores dentro de `esJugador` (justo después del `</div>` que cierra el `grid ... overflow-y-auto`, antes del cierre del `<div className="space-y-3">`):

```typescript
                          ))}
                      </div>
                    </div>
                  )}
```

Reemplazarlo por (añade el botón "+ Agregar jugador" y el formulario inline antes de cerrar el `space-y-3`):

```typescript
                          ))}
                      </div>

                      {/* Agregar jugador personalizado */}
                      {agregandoPara === premio.id ? (
                        <div className="glass p-4 rounded-lg space-y-3 border border-white/10">
                          <p className="text-sm font-semibold text-white/80">
                            Agregar jugador nuevo
                          </p>
                          <input
                            type="text"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Nombre del jugador"
                            className="w-full glass p-2 rounded-lg bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-yellow-400 outline-none"
                          />
                          <select
                            value={nuevoEquipoId}
                            onChange={(e) => setNuevoEquipoId(e.target.value)}
                            className="w-full glass p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-yellow-400 outline-none"
                          >
                            <option value="" className="bg-gray-800">
                              Selecciona un equipo
                            </option>
                            {data?.equipos.map((equipo) => (
                              <option key={equipo.id} value={equipo.id} className="bg-gray-800">
                                {equipo.nombre}
                              </option>
                            ))}
                          </select>
                          {premio.tipo !== 'GUANTE_ORO' && (
                            <select
                              value={nuevaPosicion}
                              onChange={(e) => setNuevaPosicion(e.target.value)}
                              className="w-full glass p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-yellow-400 outline-none"
                            >
                              <option value="Portero" className="bg-gray-800">Portero</option>
                              <option value="Defensa" className="bg-gray-800">Defensa</option>
                              <option value="Mediocampista" className="bg-gray-800">Mediocampista</option>
                              <option value="Delantero" className="bg-gray-800">Delantero</option>
                            </select>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCrearJugador(premio.id, premio.tipo)}
                              disabled={creando}
                            >
                              {creando ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={resetFormulario}
                              disabled={creando}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            resetFormulario()
                            setAgregandoPara(premio.id)
                            setNuevaPosicion(
                              premio.tipo === 'BOTA_ORO' ? 'Delantero' : 'Mediocampista'
                            )
                          }}
                          className="glass p-3 rounded-lg text-left hover:bg-white/20 transition-all border border-dashed border-white/20 text-white/70 w-full"
                        >
                          + Agregar jugador que no está en la lista
                        </button>
                      )}
                    </div>
                  )}
```

> **Nota:** Verificado — `components/ui/Button` acepta `variant="primary" | "secondary" | "ghost"`, por lo que `variant="secondary"` para "Cancelar" es válido.

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: Build exitoso.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/premios/page.tsx
git commit -m "feat: formulario inline para agregar jugador en premios"
```

---

### Task 5: Verificación manual end-to-end con Playwright

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Levantar el servidor de desarrollo**

Run (en background): `npm run dev`
Expected: Servidor en `http://localhost:3000`.

- [ ] **Step 2: Iniciar sesión con Playwright**

Navegar a `http://localhost:3000`, iniciar sesión con `josbelmillan@gmail.com` / `Supermario64`, ir a `/dashboard/premios`.

- [ ] **Step 3: Probar Balón de Oro**

- Click en "+ Agregar jugador que no está en la lista".
- Verificar que aparece el dropdown de posición con las 4 opciones.
- Introducir nombre, elegir equipo y posición, click Guardar.
- Esperado: alerta "Predicción guardada", el jugador aparece en la lista y queda marcado (✓), y figura en "Tu predicción".

- [ ] **Step 4: Probar Guante de Oro**

- Click en "+ Agregar jugador" del Guante de Oro.
- Esperado: NO se muestra el dropdown de posición.
- Guardar y verificar que el jugador (Portero) queda seleccionado y aparece en la lista de porteros.

- [ ] **Step 5: Verificar el filtro**

- Confirmar que en Bota de Oro aparecen jugadores de todas las posiciones.
- Confirmar que en Guante de Oro solo aparecen porteros.

- [ ] **Step 6: Detener el servidor**

Detener el proceso `npm run dev`.
