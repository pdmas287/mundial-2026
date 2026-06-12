# Módulo Admin: Gestión de Jugadores — Diseño

Fecha: 2026-06-12

## Objetivo

Crear una nueva pestaña (módulo) visible solo para administradores que permita
**ver, editar y eliminar** los jugadores existentes en la app. El admin podrá
revisar especialmente los jugadores creados por usuarios desde el formulario de
Premios, comprobar que están bien y, si no, corregirlos o eliminarlos. Al
eliminar un jugador que algún usuario tenía en su predicción, se borran esas
predicciones y se notifica a los usuarios afectados para que vuelvan a predecir.

## Alcance

- El módulo gestiona **todos** los jugadores del catálogo (los del seed y los
  creados por usuarios).
- Editar y eliminar aplica a **cualquier** jugador, no solo a los personalizados.
- Solo accesible para usuarios con rol `ADMIN` (igual que el panel admin actual).

## Cambios de esquema (Prisma)

Una migración con tres cambios:

1. `Jugador.esPersonalizado Boolean @default(false)` — `true` para jugadores
   creados desde el formulario de Premios; `false` para los del seed. Permite
   distinguirlos visualmente y filtrarlos.
2. `Jugador.createdAt DateTime @default(now())` — para ordenar y mostrar cuándo
   se creó cada jugador.
3. Nuevo valor `JUGADOR_ELIMINADO` en el enum `TipoNotificacion`.

El endpoint de creación existente `POST /api/premios/jugador` debe pasar a
guardar `esPersonalizado: true` al crear el jugador.

## Navegación

En `app/dashboard/layout.tsx`, añadir a `navItems` (después del item Admin):

```ts
{ href: '/dashboard/admin/jugadores', label: '🧑 Jugadores', icon: '🧑', adminOnly: true },
```

El componente de navegación ya filtra por `adminOnly` según el rol, así que no
requiere más cambios para ocultarlo a usuarios normales.

## Página

`app/dashboard/admin/jugadores/page.tsx` — client component. Verifica el rol con
el mismo patrón que `app/dashboard/admin/page.tsx`:

```ts
useEffect(() => {
  if (status === 'loading') return
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')
}, [session, status])
```

### UI

- **Cabecera:** título "Gestión de Jugadores" + descripción.
- **Filtro:** toggle "Solo personalizados" que filtra la lista a `esPersonalizado === true`.
- **Lista de jugadores:** ordenada con los personalizados primero, luego por
  nombre. Cada fila muestra:
  - Nombre y posición.
  - Equipo (bandera + nombre).
  - Badge "✨ Creado por usuario" si `esPersonalizado`.
  - Nº de predicciones que lo eligieron (`_count.predicciones`).
  - Botones **Editar** y **Eliminar**.
- **Editar:** formulario inline que sustituye la fila (o se despliega bajo ella)
  con:
  - Nombre: input de texto.
  - Equipo: `<select>` con las 48 naciones (`equipos`).
  - Posición: `<select>` con `Portero/Defensa/Mediocampista/Delantero`.
  - Botones Guardar / Cancelar.
- **Eliminar:** `confirm()` que muestra cuántas predicciones se verán afectadas;
  al aceptar llama al DELETE. Tras éxito, recarga la lista y muestra un `alert`
  con el resumen (jugador eliminado, N predicciones borradas, N usuarios
  notificados).

## Backend

Todos los endpoints verifican sesión (401 si no autenticado) y rol ADMIN (403 si
no es admin), siguiendo el patrón de `app/api/admin/recalcular-puntos/route.ts`.

### `GET /api/admin/jugadores`

Devuelve `{ jugadores, equipos }`:
- `jugadores`: todos los `Jugador`, cada uno con su `_count.predicciones`,
  ordenados por `esPersonalizado desc`, luego `nombre asc`. Incluye
  `id, nombre, posicion, equipoId, esPersonalizado, createdAt`.
- `equipos`: lista de `Equipo` (`id, nombre, bandera`) para los dropdowns de la
  página (edición) y para mostrar la bandera/nombre del equipo de cada jugador.

### `PATCH /api/admin/jugadores/[id]`

Edita un jugador. Entrada `{ nombre, equipoId, posicion }`. Validaciones idénticas
al endpoint de creación:
- `nombre` no vacío (trim), `nombre.length <= 100`.
- `equipoId` es string no vacío y el equipo existe.
- `posicion` ∈ `{ 'Portero', 'Defensa', 'Mediocampista', 'Delantero' }`.
- El jugador existe (404 si no).

Actualiza y devuelve el jugador. No cambia `esPersonalizado`.

### `DELETE /api/admin/jugadores/[id]`

En una transacción Prisma:
1. Buscar el jugador (404 si no existe).
2. Buscar las `prediccionPremio` que apuntan a ese `jugadorId`, incluyendo
   `userId` y el `premio` (para el mensaje).
3. Para cada usuario afectado, crear una notificación `JUGADOR_ELIMINADO`
   (título "🗑️ Jugador eliminado", mensaje del tipo
   "El jugador **X** fue eliminado. Realiza una nueva predicción en <Premio>.").
4. Borrar esas `prediccionPremio`.
5. Borrar el `Jugador`.

Devuelve `{ jugadorEliminado, prediccionesEliminadas, usuariosNotificados }`.

> Nota: las notificaciones se crean dentro de la misma transacción para que, si
> algo falla, no queden notificaciones huérfanas de un borrado que no ocurrió.
> Como `crearNotificacion` (en `lib/notificaciones.ts`) usa el cliente global
> `prisma` y no acepta un cliente de transacción, dentro de la transacción se usa
> directamente `tx.notificacion.createMany(...)` con los datos de cada usuario
> afectado (tipo `JUGADOR_ELIMINADO`).

## Flujo de notificación

Reutiliza el patrón de `lib/notificaciones.ts`. Cada usuario con predicción del
jugador eliminado recibe una notificación con el nuevo tipo `JUGADOR_ELIMINADO`,
visible en el centro de notificaciones existente (campana 🔔).

## Manejo de errores

- Backend: 400 (validación), 401 (no autenticado), 403 (no admin), 404 (no
  encontrado), 500 (error inesperado), todos con `{ error: string }`.
- Frontend: muestra el mensaje con `alert(...)` y recarga la lista tras cada
  operación, consistente con el resto del dashboard.

## Verificación

Prueba manual end-to-end con Playwright (credenciales admin de prueba):
1. Iniciar sesión como admin, confirmar que aparece la pestaña "Jugadores".
2. Confirmar que un usuario no-admin no ve la pestaña ni puede acceder a la ruta.
3. Crear un jugador personalizado desde Premios, ir al módulo y verificar que
   aparece con el badge "Creado por usuario".
4. Editarlo (nombre/equipo/posición) y verificar que el cambio persiste.
5. Hacer una predicción con ese jugador desde otra cuenta, eliminarlo como admin,
   y verificar que: el jugador desaparece, la predicción se borra y el usuario
   afectado recibe la notificación.
