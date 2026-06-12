# Jugador personalizado en Premios — Diseño

Fecha: 2026-06-12

## Objetivo

En la sección de Premios (`/dashboard/premios`), permitir que cualquier usuario
autenticado agregue un jugador que no está entre los elegibles para los premios
Balón de Oro, Bota de Oro y Guante de Oro. El jugador se crea como un registro
`Jugador` real en la base de datos (catálogo global), por lo que queda disponible
de inmediato para todos los usuarios. Tras crearlo, se selecciona automáticamente
como la predicción del usuario para ese premio.

## Alcance

- Aplica a los tres premios de jugador: `BALON_ORO`, `BOTA_ORO`, `GUANTE_ORO`.
- Cualquier usuario autenticado puede agregar un jugador (no se requiere rol admin).

## Decisión de diseño: sin filtro por posición

Actualmente la lista de elegibles en el frontend filtra por posición:
- `BOTA_ORO` → solo `Delantero`
- `GUANTE_ORO` → solo `Portero`

**Este filtro se elimina.** Los tres premios mostrarán todos los jugadores del
catálogo. La posición se sigue guardando como dato del jugador, pero ya no
condiciona qué jugadores aparecen como elegibles.

## Componentes

### 1. Backend — `POST /api/premios/jugador`

Nuevo endpoint (archivo `app/api/premios/jugador/route.ts`).

- **Entrada:** `{ nombre: string, equipoId: string, posicion: string }`
- **Validaciones:**
  - Sesión activa (401 si no).
  - `nombre` no vacío (tras `trim`) → 400.
  - `equipoId` existe en la tabla `Equipo` → 400 si no.
  - `posicion` ∈ `{ 'Portero', 'Defensa', 'Mediocampista', 'Delantero' }` → 400 si no.
- **Anti-duplicados:** si ya existe un `Jugador` con el mismo `nombre` (normalizado,
  case-insensitive tras `trim`) y mismo `equipoId`, se devuelve ese registro en
  lugar de crear un duplicado.
- **Salida:** el registro `Jugador` creado o existente (200/201).

### 2. Frontend — `app/dashboard/premios/page.tsx`

- **Eliminar** el `.filter()` por posición en la lista de elegibles. Los tres
  premios de jugador iteran sobre `data.jugadores` completo.
- Debajo de la lista de jugadores de cada premio de jugador, agregar un botón
  **"+ Agregar jugador"** que despliega un formulario inline con:
  - **Nombre:** input de texto.
  - **Equipo:** `<select>` con las naciones de `data.equipos` (muestra `nombre`,
    value `id`).
  - **Posición:**
    - Si el premio es `GUANTE_ORO`: el campo **no se muestra**; se envía `Portero`.
    - Si el premio es `BALON_ORO` o `BOTA_ORO`: `<select>` con
      `Portero, Defensa, Mediocampista, Delantero`.
  - Botones **Guardar** y **Cancelar**.
- **Al guardar:**
  1. `POST /api/premios/jugador` con `{ nombre, equipoId, posicion }`.
  2. Si OK, llamar `handleSavePrediccion(premioId, nuevoJugador.id)` para
     registrar la predicción del usuario.
  3. `fetchPremios()` para recargar (el nuevo jugador ya aparece en la lista y
     queda marcado como seleccionado).
  4. Cerrar y limpiar el formulario.

## Estado del componente

El formulario inline se controla por premio. Estado nuevo en el componente:
- `agregandoPara: string | null` — id del premio cuyo formulario está abierto.
- `nuevoNombre: string`
- `nuevoEquipoId: string`
- `nuevaPosicion: string`
- `creando: boolean` — para deshabilitar el botón mientras se crea.

## Manejo de errores

- El backend devuelve 400/401/404/500 con `{ error: string }`.
- El frontend muestra el mensaje con `alert(...)`, consistente con el patrón
  actual de la página.

## Sin cambios de esquema

El modelo `Jugador` ya tiene `nombre`, `posicion`, `equipoId`, `foto?`. No se
requiere migración de Prisma. El campo `foto` queda `null` para jugadores
personalizados.

## Pruebas / verificación

Verificación manual end-to-end con Playwright usando las credenciales de prueba:
1. Iniciar sesión.
2. Ir a `/dashboard/premios`.
3. En Balón de Oro: agregar un jugador con nombre, equipo y posición; confirmar
   que aparece y queda seleccionado.
4. En Guante de Oro: confirmar que el formulario NO pide posición y el jugador se
   crea como Portero.
5. Confirmar que todos los jugadores aparecen en los tres premios (sin filtro).
