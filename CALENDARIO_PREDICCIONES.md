# 📅 Sistema de Calendario y Predicciones

## ✅ Implementación Completada

El sistema de calendario con predicciones está completamente funcional.

---

## 🎯 Funcionalidades Implementadas

### 1. API Routes

#### `GET /api/partidos`
Obtiene todos los partidos de la fase de grupos.

**Query Parameters:**
- `grupo` (opcional): Filtra por grupo específico (A-L)

**Response:**
```json
[
  {
    "id": "...",
    "fecha": "2026-06-11T17:00:00.000Z",
    "sede": "Ciudad de México",
    "estadio": "Estadio Ciudad de México",
    "grupo": "A",
    "fase": "GRUPOS",
    "equipoLocal": {
      "nombre": "México",
      "codigo": "MEX",
      "bandera": "🇲🇽"
    },
    "equipoVisitante": {
      "nombre": "Canadá",
      "codigo": "CAN",
      "bandera": "🇨🇦"
    },
    "predicciones": [...] // Solo si usuario está logueado
  }
]
```

#### `POST /api/predicciones`
Guarda o actualiza una predicción.

**Request:**
```json
{
  "partidoId": "string",
  "golesLocal": 2,
  "golesVisitante": 1
}
```

**Validaciones:**
- ✅ Usuario autenticado
- ✅ Partido existe
- ✅ Partido no ha comenzado
- ✅ Goles entre 0 y 20

**Response:**
```json
{
  "message": "Predicción guardada exitosamente",
  "prediccion": {
    "id": "...",
    "userId": "...",
    "partidoId": "...",
    "golesLocal": 2,
    "golesVisitante": 1
  }
}
```

#### `GET /api/predicciones`
Obtiene todas las predicciones del usuario autenticado.

**Response:**
```json
[
  {
    "id": "...",
    "golesLocal": 2,
    "golesVisitante": 1,
    "puntosObtenidos": null,
    "partido": {
      "fecha": "...",
      "equipoLocal": {...},
      "equipoVisitante": {...}
    }
  }
]
```

---

### 2. Componentes

#### `PartidoCard`
Componente para mostrar un partido con opción de predecir.

**Props:**
```typescript
interface PartidoCardProps {
  partido: Partido
  onPredict?: (partidoId: string, golesLocal: number, golesVisitante: number) => Promise<void>
}
```

**Características:**
- ✅ Muestra información completa del partido
- ✅ Inputs para ingresar predicción (antes del partido)
- ✅ Validación de goles (0-20)
- ✅ Botón para guardar/actualizar predicción
- ✅ Feedback visual al guardar
- ✅ Muestra estado del partido (pendiente/en curso/finalizado)
- ✅ Compara predicción vs resultado real
- ✅ Deshabilita inputs si partido ya comenzó
- ✅ Muestra badge de "Predicho" si hay predicción

**Estados del partido:**
- **Pendiente:** Se puede predecir
- **En Curso:** No se puede predecir (amarillo)
- **Finalizado:** Muestra resultado real (verde)

---

### 3. Páginas del Dashboard

#### `/dashboard` - Home
Dashboard principal con información general.

**Contenido:**
- ✅ Mensaje de bienvenida personalizado
- ✅ Quick actions (Calendario, Predicciones, Ranking)
- ✅ Guía de cómo jugar
- ✅ Explicación del sistema de puntos

#### `/dashboard/calendario` - Calendario
Página principal para ver partidos y hacer predicciones.

**Características:**
- ✅ Filtros por grupo (Todos, A-L)
- ✅ Estadísticas de usuario:
  - Predicciones realizadas
  - Partidos pendientes
  - Partidos completados
- ✅ Lista de partidos agrupados por grupo
- ✅ Formulario inline para hacer predicciones
- ✅ Actualización en tiempo real
- ✅ Loading states
- ✅ Empty states

**Filtros:**
- **TODOS:** Muestra todos los grupos con headers
- **A-L:** Muestra solo el grupo seleccionado

#### `/dashboard/predicciones` - Mis Predicciones
Historial completo de predicciones del usuario.

**Características:**
- ✅ Estadísticas resumidas:
  - Total de predicciones
  - Aciertos
  - Puntos ganados
  - Efectividad (%)
- ✅ Lista completa de predicciones
- ✅ Comparación predicción vs resultado
- ✅ Puntos obtenidos por predicción
- ✅ Estados visuales (correcto/incorrecto/pendiente)
- ✅ Información del partido

#### `/dashboard/layout` - Layout Compartido
Layout común para todas las páginas del dashboard.

**Características:**
- ✅ Header sticky con:
  - Logo y nombre
  - Información del usuario
  - Botón de logout
- ✅ Navegación horizontal
- ✅ Responsivo (mobile-first)
- ✅ Footer
- ✅ Protección de rutas (middleware)

---

## 🔄 Flujo de Predicción

### 1. Ver Partidos
```
Usuario → /dashboard/calendario → GET /api/partidos → Muestra partidos
```

### 2. Hacer Predicción
```
Usuario ingresa goles → Click "Predecir" → POST /api/predicciones → Success feedback
```

### 3. Actualizar Predicción
```
Usuario modifica goles → Click "Actualizar" → POST /api/predicciones (upsert) → Success
```

### 4. Ver Predicciones
```
Usuario → /dashboard/predicciones → GET /api/predicciones → Muestra historial
```

---

## 🛡️ Validaciones

### Client-side
- ✅ Goles entre 0 y 20
- ✅ Números enteros únicamente
- ✅ Campos requeridos

### Server-side (API)
- ✅ Usuario autenticado (401 si no)
- ✅ Partido existe (404 si no)
- ✅ Partido no ha comenzado (400 si ya comenzó)
- ✅ Validación de schema con Zod
- ✅ Sanitización de inputs

### Database
- ✅ Unique constraint: `userId + partidoId`
- ✅ Un usuario solo puede predecir una vez por partido
- ✅ Si intenta duplicar, se actualiza (upsert)

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptaciones:**
- ✅ Grid responsive (1-3 columnas)
- ✅ Navegación colapsable en móvil
- ✅ Cards apiladas en móvil
- ✅ Inputs táctiles (tamaño adecuado)

---

## 🎨 Estados Visuales

### PartidoCard
- **Sin predicción:** Inputs vacíos, botón "Predecir"
- **Con predicción:** Inputs con valores, botón "Actualizar", badge "Predicho"
- **Guardando:** Loading en botón, inputs disabled
- **Guardado:** Overlay verde con "✓ Predicción guardada"
- **Partido comenzado:** Advertencia amarilla, inputs disabled
- **Partido terminado:** Resultado real visible, badge "Finalizado"

### Loading States
- ✅ Skeleton loaders
- ✅ Spinner animado
- ✅ Botones con estado loading
- ✅ Disabled states

### Empty States
- ✅ Emoji grande
- ✅ Mensaje descriptivo
- ✅ Call to action

---

## 🧪 Testing Manual

### Test 1: Ver Partidos
```
1. Login con demo@mundial2026.com
2. Ve a /dashboard/calendario
3. Deberías ver 72 partidos de grupos
4. Prueba filtrar por grupo A, B, C
5. Verifica que muestra solo partidos del grupo
```

### Test 2: Hacer Predicción
```
1. Selecciona un partido futuro
2. Ingresa goles (ej: 2 - 1)
3. Click en "Predecir"
4. Deberías ver "✓ Predicción guardada"
5. Refresca la página
6. La predicción debe seguir ahí
```

### Test 3: Actualizar Predicción
```
1. Modifica los goles de una predicción existente
2. Click en "Actualizar"
3. Deberías ver "✓ Predicción guardada"
4. La predicción se actualiza en BD
```

### Test 4: Validación de Fecha
```
1. Intenta predecir un partido que ya comenzó
   (Para esto necesitarías cambiar la fecha en BD)
2. Deberías ver error: "No se puede predecir un partido que ya comenzó"
```

### Test 5: Ver Mis Predicciones
```
1. Ve a /dashboard/predicciones
2. Deberías ver lista de todas tus predicciones
3. Verifica estadísticas (total, aciertos, puntos)
4. Para partidos terminados, compara predicción vs resultado
```

---

## 📊 Estadísticas Mostradas

### En Calendario
- **Predicciones Realizadas:** Cantidad de partidos predichos
- **Partidos Pendientes:** Partidos que aún no han comenzado
- **Partidos Completados:** Partidos finalizados

### En Mis Predicciones
- **Total Predicciones:** Cantidad total
- **Aciertos:** Predicciones con puntos > 0
- **Puntos Ganados:** Suma de todos los puntos
- **Efectividad:** (Aciertos / Total) * 100

---

## 🚀 Próximas Mejoras

Funcionalidades que se pueden agregar:

1. **Filtros Avanzados**
   - Por fecha
   - Por sede
   - Partidos predichos/sin predecir

2. **Ordenamiento**
   - Por fecha
   - Por grupo
   - Por estado

3. **Búsqueda**
   - Por equipo
   - Por sede

4. **Notificaciones**
   - Recordatorio antes del partido
   - Partido por comenzar

5. **Estadísticas Avanzadas**
   - Gráficas de rendimiento
   - Comparación con otros usuarios
   - Racha de aciertos

6. **Compartir**
   - Compartir predicción en redes
   - Invitar amigos

---

## 🐛 Problemas Conocidos

### 1. Zona Horaria
- Las fechas están en UTC
- Se muestran en la zona horaria local del navegador
- Para producción, considerar zona horaria del usuario

### 2. Actualización en Tiempo Real
- No hay WebSockets
- Usuario debe refrescar para ver cambios de otros usuarios
- Considerar Server-Sent Events (SSE) para el futuro

### 3. Optimización
- No hay paginación (72 partidos caben en una página)
- Para más partidos, implementar paginación o infinite scroll

---

## ✅ Checklist de Funcionalidades

- [x] API de partidos con filtros
- [x] API de predicciones (GET/POST)
- [x] Componente PartidoCard
- [x] Página de calendario con filtros
- [x] Página de mis predicciones
- [x] Layout del dashboard
- [x] Navegación responsive
- [x] Validaciones client/server
- [x] Estados visuales (loading, success, error)
- [x] Empty states
- [x] Estadísticas de usuario
- [x] Protección de rutas
- [x] Responsive design

---

## 📝 Uso de la API

### Ejemplo: Obtener partidos del Grupo A
```javascript
const response = await fetch('/api/partidos?grupo=A')
const partidos = await response.json()
```

### Ejemplo: Guardar predicción
```javascript
const response = await fetch('/api/predicciones', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    partidoId: 'abc123',
    golesLocal: 2,
    golesVisitante: 1
  })
})

const result = await response.json()
```

### Ejemplo: Ver mis predicciones
```javascript
const response = await fetch('/api/predicciones')
const predicciones = await response.json()
```

---

## 🎉 Estado Actual

- ✅ Sistema de calendario completamente funcional
- ✅ Predicciones guardándose correctamente en BD
- ✅ Filtros por grupo funcionando
- ✅ Validaciones implementadas
- ✅ UI responsive y pulida
- ✅ Feedback visual para el usuario
- ✅ Historial de predicciones

**El usuario ya puede:**
1. Ver todos los partidos del Mundial 2026
2. Filtrar por grupo
3. Hacer predicciones antes del partido
4. Actualizar predicciones existentes
5. Ver su historial completo
6. Revisar estadísticas personales
