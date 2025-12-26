# Sistema de Clasificación Mundial FIFA 2026

## 📋 Descripción General

Este documento describe el sistema implementado para gestionar la clasificación de equipos desde la fase de grupos hasta las fases eliminatorias del Mundial FIFA 2026.

**Características principales:**
- 48 equipos en 12 grupos de 4 (A-L)
- Clasifican 32 equipos a dieciseisavos de final
- Sistema automático de asignación según reglamento FIFA
- Implementación completa del Anexo C

---

## 🏆 Estructura del Torneo

### Fase de Grupos
- **12 grupos** (A, B, C, D, E, F, G, H, I, J, K, L)
- **4 equipos** por grupo
- **Clasifican por grupo:**
  - 1° lugar (12 equipos)
  - 2° lugar (12 equipos)
  - Además, los **8 mejores terceros** lugares

**Total de clasificados: 32 equipos**

### Fases Eliminatorias
1. **Dieciseisavos de final** - 32 equipos → 16 partidos
2. **Octavos de final** - 16 equipos → 8 partidos
3. **Cuartos de final** - 8 equipos → 4 partidos
4. **Semifinales** - 4 equipos → 2 partidos
5. **Tercer puesto** - Perdedores de semifinales
6. **Final** - Ganadores de semifinales

---

## 📊 Criterios de Desempate (Art. 12 FIFA)

### En la Fase de Grupos

Cuando dos o más equipos terminan con los mismos puntos:

#### 1. Entre equipos empatados (duelos directos):
1. Más puntos en partidos entre ellos
2. Mejor diferencia de goles entre ellos
3. Más goles marcados entre ellos

#### 2. Si siguen empatados (todo el grupo):
4. Mejor diferencia de goles en todos los partidos
5. Más goles marcados en todos los partidos
6. Mejor puntuación de Fair Play:
   - Amarilla: -1
   - Roja por doble amarilla: -3
   - Roja directa: -4
   - Amarilla + roja directa: -5
7. Posición en ranking FIFA más reciente
8. Retroceder a rankings anteriores hasta desempatar

---

## 🥉 Selección de los 8 Mejores Terceros (Art. 13 FIFA)

Los 12 terceros lugares se ordenan por:

1. **Más puntos** en todos los partidos de grupo
2. **Mejor diferencia de goles** en todos los partidos
3. **Más goles marcados** en todos los partidos
4. **Mejor puntuación de Fair Play** (mismo sistema)
5. **Posición en ranking FIFA** más reciente
6. Retroceder a rankings anteriores

**Los 8 primeros** de esta lista clasifican a dieciseisavos.

---

## 🗂️ Sistema de Emparejamientos en Dieciseisavos

### Partidos Fijos (1° vs 2°)

| Partido | Emparejamiento |
|---------|----------------|
| M73 | 2° Grupo A vs 2° Grupo B |
| M75 | 1° Grupo F vs 2° Grupo C |
| M76 | 1° Grupo C vs 2° Grupo F |
| M78 | 2° Grupo E vs 2° Grupo I |
| M83 | 2° Grupo K vs 2° Grupo L |
| M84 | 1° Grupo H vs 2° Grupo J |
| M86 | 1° Grupo J vs 2° Grupo H |
| M88 | 2° Grupo D vs 2° Grupo G |

### Partidos con Terceros (1° vs Mejor 3°)

| Partido | 1° de Grupo | 3° de Grupos Posibles |
|---------|-------------|------------------------|
| M74 | 1° Grupo E | A/B/C/D/F |
| M77 | 1° Grupo I | C/D/F/G/H |
| M79 | 1° Grupo A | C/E/F/H/I |
| M80 | 1° Grupo L | E/H/I/J/K |
| M81 | 1° Grupo D | B/E/F/I/J |
| M82 | 1° Grupo G | A/E/H/I/J |
| M85 | 1° Grupo B | E/F/G/I/J |
| M87 | 1° Grupo K | D/E/I/J/L |

**Importante:** La asignación exacta se determina mediante el **Anexo C** según qué 8 grupos aporten terceros clasificados.

---

## 💻 Implementación Técnica

### Archivos del Sistema

#### 1. **prisma/schema.prisma**
```prisma
model Partido {
  equipoLocalId     String?  // ✅ Opcional para TBD
  equipoVisitanteId String?  // ✅ Opcional para TBD
  equipoLocal       Equipo?  @relation("EquipoLocal", ...)
  equipoVisitante   Equipo?  @relation("EquipoVisitante", ...)
}

enum Fase {
  GRUPOS
  DIECISEISAVOS    // ✅ Nuevo
  OCTAVOS
  CUARTOS
  SEMIFINAL
  TERCER_PUESTO
  FINAL
}

enum Ronda {
  M73, M74, M75, ... M104  // ✅ Partidos del torneo
}
```

#### 2. **lib/clasificacion.ts**
Funciones principales:
- `calcularTablaGrupo(grupo)` - Tabla de posiciones con criterios FIFA
- `obtenerClasificadosGrupo(grupo)` - 1° y 2° lugar
- `obtenerTerceroGrupo(grupo)` - 3° lugar
- `calcularMejoresTerceros()` - Los 8 mejores terceros ordenados
- `fasesGruposCompletada()` - Verificar si fase terminó

#### 3. **lib/anexo-c.ts**
Sistema del Anexo C de FIFA:
- `encontrarCombinacionAnexoC(gruposConTerceros)` - Encuentra combinación
- `asignarTercerosAPartidos(mejoresTerceros, gruposClasificados)` - Asigna a partidos
- Implementación de las 495 combinaciones posibles

#### 4. **scripts/asignar-clasificados.ts**
Script principal que ejecuta todo el proceso:
```bash
npm run asignar-clasificados
```

#### 5. **lib/puntuacion.ts**
Sistema de puntos actualizado:
```typescript
const MULTIPLICADORES = {
  GRUPOS: 1,
  DIECISEISAVOS: 1.25,  // ✅ Nuevo
  OCTAVOS: 1.5,
  CUARTOS: 2,
  SEMIFINAL: 2.5,
  TERCER_PUESTO: 2,
  FINAL: 3,
}
```

---

## 🚀 Flujo de Uso

### 1. Durante el Torneo (Grupos)

Los administradores publican resultados de partidos:

```typescript
// API: POST /api/partidos/[id]/resultado
{
  golesLocal: 2,
  golesVisitante: 1
}
```

El sistema:
- ✅ Calcula puntos de predicciones
- ✅ Actualiza ranking
- ✅ Crea notificaciones
- ✅ Partidos de eliminatorias muestran "TBD vs TBD"

### 2. Al Finalizar Fase de Grupos

Ejecutar el script de asignación:

```bash
npm run asignar-clasificados
```

El script automáticamente:
1. ✅ Verifica que todos los partidos de grupos estén finalizados
2. ✅ Calcula 1° y 2° de cada grupo (24 equipos)
3. ✅ Ordena los 12 terceros lugares
4. ✅ Selecciona los 8 mejores terceros
5. ✅ Aplica el Anexo C según grupos clasificados
6. ✅ Actualiza los 16 partidos de dieciseisavos con equipos
7. ✅ Los usuarios ven automáticamente los emparejamientos

### 3. Predicciones de Eliminatorias

Los usuarios pueden predecir dieciseisavos:
- **Antes de la asignación**: Ven "TBD vs TBD" pero pueden predecir
- **Después de la asignación**: Ven equipos reales (ej: "México vs Brasil")

---

## 📝 Migraciones de Base de Datos

### Aplicar Cambios al Schema

```bash
# Opción 1: Push directo (desarrollo)
npx prisma db push

# Opción 2: Generar migración (producción)
npx prisma migrate dev --name add_mundial_2026_system

# Opción 3: Aplicar migración en producción
npx prisma migrate deploy
```

### Regenerar Cliente Prisma

```bash
npx prisma generate
```

---

## 🎯 Ejemplos de Uso

### Consultar Tabla de un Grupo

```typescript
import { calcularTablaGrupo } from '@/lib/clasificacion'

const tabla = await calcularTablaGrupo('A')

tabla.forEach((posicion, index) => {
  console.log(`${index + 1}. ${posicion.equipo.nombre}`)
  console.log(`   Puntos: ${posicion.puntos}`)
  console.log(`   DG: ${posicion.diferenciaGoles}`)
})
```

### Obtener Clasificados

```typescript
import { obtenerClasificadosGrupo } from '@/lib/clasificacion'

const { primero, segundo } = await obtenerClasificadosGrupo('A')

console.log(`1°: ${primero.nombre}`)
console.log(`2°: ${segundo.nombre}`)
```

### Ver Mejores Terceros

```typescript
import { calcularMejoresTerceros } from '@/lib/clasificacion'

const { mejoresTerceros, gruposClasificados } = await calcularMejoresTerceros()

console.log('Los 8 mejores terceros:')
mejoresTerceros.forEach((tercero, i) => {
  console.log(`${i + 1}. Grupo ${tercero.equipo.grupo}: ${tercero.equipo.nombre}`)
})

console.log('Grupos con terceros clasificados:', gruposClasificados)
// Ejemplo: ['A', 'C', 'D', 'E', 'F', 'H', 'I', 'J']
```

---

## ⚙️ API de Admin

### Endpoint para Asignar Clasificados (Opcional)

Se puede crear un endpoint para ejecutar la asignación vía API:

```typescript
// app/api/admin/asignar-clasificados/route.ts
export async function POST(request: Request) {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Ejecutar asignación
  const resultado = await ejecutarAsignacionClasificados()

  return NextResponse.json(resultado)
}
```

---

## 🔍 Casos Especiales

### Empates en Terceros Lugares

Si dos terceros tienen mismos puntos, DG y goles:
- Se usa **Fair Play** (tarjetas)
- Si siguen empatados: **Ranking FIFA**

### Anexo C - 495 Combinaciones

El sistema soporta todas las combinaciones posibles de qué 8 grupos aportan terceros. La tabla del Anexo C define exactamente qué tercer lugar va a cada partido.

**Ejemplo:**
- Si clasifican terceros de: A, C, D, E, F, H, I, J
- El Anexo C define: 3E → M74, 3J → M85, etc.

### Partidos TBD

Los partidos de eliminatorias se crean en el seed con `equipoLocalId: null` y `equipoVisitanteId: null`. Esto permite:
- ✅ Mostrar calendario completo desde el inicio
- ✅ Predicciones anticipadas
- ✅ UI muestra "TBD vs TBD"
- ✅ Asignación automática después de grupos

---

## 📊 Multiplicadores de Puntos

| Fase | Multiplicador | Puntos Máximos |
|------|---------------|----------------|
| Grupos | 1.0x | 5 pts |
| **Dieciseisavos** | **1.25x** | **6 pts** |
| Octavos | 1.5x | 8 pts |
| Cuartos | 2.0x | 10 pts |
| Semifinal | 2.5x | 13 pts |
| Tercer Puesto | 2.0x | 10 pts |
| Final | 3.0x | 15 pts |

---

## ✅ Testing

### Verificar Implementación

```bash
# 1. Aplicar schema
npx prisma db push

# 2. Regenerar cliente
npx prisma generate

# 3. Ejecutar seed (crea partidos con TBD)
npm run db:seed

# 4. Simular resultados de grupos
npm run simular-resultados

# 5. Asignar clasificados
npm run asignar-clasificados

# 6. Verificar en Prisma Studio
npm run db:studio
```

---

## 🎉 Resumen

El sistema implementado:

✅ **Schema actualizado** - Equipos opcionales + fase DIECISEISAVOS
✅ **Criterios FIFA** - Todos los criterios de desempate implementados
✅ **8 mejores terceros** - Cálculo automático con ordenamiento correcto
✅ **Anexo C** - Sistema de asignación según reglamento
✅ **Script automatizado** - Un comando ejecuta todo el proceso
✅ **UI preparada** - Maneja TBD correctamente
✅ **Multiplicadores** - Sistema de puntos actualizado
✅ **Producción-ready** - Listo para usar

**El sistema está completo y funcional para el Mundial 2026! 🏆**
