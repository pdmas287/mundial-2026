# 🏅 Sistema de Cálculo de Puntos

## ✅ Implementación Completada

El sistema de cálculo automático de puntos está completamente funcional.

---

## 📊 Cómo Funciona

### 1. Actualización de Resultados

Cuando se actualiza el resultado de un partido:

1. **Se guarda el resultado real** en la base de datos
2. **Se calcula puntos para cada predicción** usando el algoritmo de puntuación
3. **Se actualizan las predicciones** con los puntos obtenidos
4. **Se recalcula el total de puntos** de cada usuario afectado

---

## 🎯 Algoritmo de Puntuación

### Puntos Base

| Acierto | Puntos | Descripción |
|---------|--------|-------------|
| Resultado exacto | **5 pts** | Acertar el marcador completo (ej: 2-1) |
| Goles de un equipo | **2 pts** | Acertar goles de local O visitante |
| Ganador/Empate | **1 pt** | Acertar quién gana o si empatan |
| Fallo total | **0 pts** | No acertar nada |

**Nota:** Los puntos NO son acumulativos. Se otorga el mayor acierto.

### Multiplicadores por Fase

| Fase | Multiplicador |
|------|---------------|
| Fase de Grupos | x1 |
| Octavos de Final | x1.5 |
| Cuartos de Final | x2 |
| Semifinales | x2.5 |
| Tercer Puesto | x2 |
| Final | x3 |

### Ejemplos

#### Ejemplo 1: Resultado Exacto
```
Resultado Real:     2 - 1
Predicción:         2 - 1
Fase: Grupos (x1)

Puntos Base:        5 (resultado exacto)
Multiplicador:      x1
Puntos Totales:     5 pts
```

#### Ejemplo 2: Goles de un Equipo
```
Resultado Real:     2 - 0
Predicción:         2 - 1
Fase: Cuartos (x2)

Puntos Base:        2 (acertó goles local)
Multiplicador:      x2
Puntos Totales:     4 pts
```

#### Ejemplo 3: Solo Ganador
```
Resultado Real:     3 - 1
Predicción:         1 - 0
Fase: Final (x3)

Puntos Base:        1 (acertó ganador)
Multiplicador:      x3
Puntos Totales:     3 pts
```

#### Ejemplo 4: Fallo Total
```
Resultado Real:     1 - 2
Predicción:         2 - 0
Fase: Cualquiera

Puntos:             0 pts (ni ganador, ni goles, ni resultado)
```

---

## 🔧 API Endpoints

### 1. Actualizar Resultado de un Partido

**Endpoint:** `POST /api/partidos/[id]/resultado`

**Autenticación:** Requerida

**Request Body:**
```json
{
  "golesLocal": 2,
  "golesVisitante": 1,
  "penalesLocal": 4,      // Opcional, para eliminatorias
  "penalesVisitante": 3   // Opcional
}
```

**Response (200):**
```json
{
  "message": "Resultado actualizado y puntos calculados exitosamente",
  "partido": {
    "id": "...",
    "golesLocal": 2,
    "golesVisitante": 1,
    "estado": "FINALIZADO"
  },
  "prediccionesActualizadas": 15,
  "usuariosActualizados": 12
}
```

**Proceso Automático:**
1. Actualiza el resultado del partido
2. Cambia estado a "FINALIZADO"
3. Calcula puntos para todas las predicciones
4. Actualiza `puntosObtenidos` en cada predicción
5. Recalcula `puntosTotal` de cada usuario

### 2. Recalcular Todos los Puntos

**Endpoint:** `POST /api/admin/recalcular-puntos`

**Autenticación:** Requerida

**Request Body:** Ninguno

**Response (200):**
```json
{
  "message": "Puntos recalculados exitosamente",
  "partidosFinalizados": 10,
  "prediccionesActualizadas": 50,
  "usuariosActualizados": 8
}
```

**Uso:** Para corregir inconsistencias o después de cambiar el algoritmo de puntuación.

---

## 🖥️ Panel de Administración

### Acceso

Ruta: `/dashboard/admin`

### Funcionalidades

#### 1. Actualizar Resultado Individual

Para cada partido:
- Ingresar goles del equipo local
- Ingresar goles del equipo visitante
- Click en "Finalizar Partido" o "Actualizar"

**Resultado:**
- Partido marcado como FINALIZADO
- Puntos calculados automáticamente
- Usuarios actualizados

#### 2. Recalcular Todos los Puntos

Botón: "🔄 Recalcular Todos los Puntos"

**Uso:**
- Cuando hay inconsistencias
- Después de modificar el algoritmo
- Para corregir errores masivos

**Proceso:**
1. Busca todos los partidos finalizados
2. Recalcula puntos de todas las predicciones
3. Actualiza totales de todos los usuarios

---

## 🧪 Testing

### Opción 1: Script de Simulación (Recomendado)

```bash
npm run simular-resultados
```

**Qué hace:**
1. Selecciona los primeros 5 partidos
2. Genera resultados aleatorios
3. Actualiza los partidos
4. Calcula puntos automáticamente
5. Muestra resumen en consola

**Output esperado:**
```
🎲 Simulando resultados de partidos...

📊 Procesando 5 partidos...

⚽ 🇲🇽 México 2 - 1 Canadá 🇨🇦
  ├─ Usuario Demo: predicción 3-1 → 2 pts
  ├─ Juan Pérez: predicción 2-1 → 5 pts
  └─ 2 predicciones procesadas (2 con puntos)

🔄 Recalculando puntos totales...

  ✓ Usuario Demo: 8 puntos totales
  ✓ Juan Pérez: 15 puntos totales

✅ Simulación completada!
   - 5 partidos finalizados
   - 2 usuarios actualizados
```

### Opción 2: Panel Admin Manual

1. Ve a `/dashboard/admin`
2. Selecciona un partido
3. Ingresa resultado (ej: 2-1)
4. Click en "Finalizar Partido"
5. Ve a `/dashboard/predicciones`
6. Verifica que los puntos se calcularon

### Opción 3: API Directa

```bash
# Actualizar resultado de un partido
curl -X POST http://localhost:3000/api/partidos/[ID]/resultado \
  -H "Content-Type: application/json" \
  -d '{
    "golesLocal": 2,
    "golesVisitante": 1
  }'
```

---

## 📝 Flujo Completo

### 1. Usuario hace predicción
```
Usuario → PartidoCard → POST /api/predicciones
→ Predicción guardada con puntosObtenidos: null
```

### 2. Partido se juega

```
Real: México 2 - 1 Canadá
```

### 3. Admin actualiza resultado

```
Admin → /dashboard/admin → Ingresa 2-1 → Click "Finalizar"
→ POST /api/partidos/[id]/resultado
```

### 4. Sistema calcula puntos

```typescript
// Predicción 1: Usuario predijo 2-1
calcularPuntos(
  prediccion: { golesLocal: 2, golesVisitante: 1 },
  resultado: { golesLocal: 2, golesVisitante: 1 },
  fase: 'GRUPOS'
)
→ Resultado exacto: 5 pts × 1 = 5 pts ✅

// Predicción 2: Usuario predijo 3-1
calcularPuntos(
  prediccion: { golesLocal: 3, golesVisitante: 1 },
  resultado: { golesLocal: 2, golesVisitante: 1 },
  fase: 'GRUPOS'
)
→ Goles visitante: 2 pts × 1 = 2 pts ✅

// Predicción 3: Usuario predijo 1-2
calcularPuntos(
  prediccion: { golesLocal: 1, golesVisitante: 2 },
  resultado: { golesLocal: 2, golesVisitante: 1 },
  fase: 'GRUPOS'
)
→ Fallo total: 0 pts ❌
```

### 5. Actualización de BD

```sql
-- Actualizar predicción 1
UPDATE Prediccion
SET puntosObtenidos = 5
WHERE id = 'pred1'

-- Actualizar predicción 2
UPDATE Prediccion
SET puntosObtenidos = 2
WHERE id = 'pred2'

-- Actualizar predicción 3
UPDATE Prediccion
SET puntosObtenidos = 0
WHERE id = 'pred3'

-- Recalcular total del usuario 1
UPDATE User
SET puntosTotal = 5 + 2 + ... (suma de todas sus predicciones)
WHERE id = 'user1'
```

### 6. Usuario ve sus puntos

```
Usuario → /dashboard/predicciones
→ Ve predicción con puntos calculados
→ Ve puntos totales actualizados
```

---

## 🔍 Validaciones

### Al Actualizar Resultado

✅ Usuario autenticado
✅ Partido existe
✅ Goles entre 0 y 20
✅ Schema válido con Zod

### Al Calcular Puntos

✅ Predicción existe
✅ Resultado existe
✅ Fase es válida
✅ Multiplicador correcto

---

## 🐛 Troubleshooting

### Puntos no se calculan

**Posibles causas:**
1. Partido no marcado como FINALIZADO
2. Error en el cálculo
3. Predicción no existe

**Solución:**
```bash
# Recalcular todos los puntos
curl -X POST http://localhost:3000/api/admin/recalcular-puntos
```

### Puntos incorrectos

**Posibles causas:**
1. Error en el algoritmo
2. Multiplicador incorrecto
3. Fase incorrecta

**Solución:**
1. Verificar `lib/puntuacion.ts`
2. Ejecutar `npm run simular-resultados` para probar
3. Recalcular todos los puntos

### Usuario no se actualiza

**Posibles causas:**
1. Error en la transacción
2. Predicción no asociada al usuario

**Solución:**
1. Verificar logs del servidor
2. Usar Prisma Studio para verificar datos
3. Recalcular puntos manualmente

---

## 📊 Monitoreo

### Ver Puntos en Tiempo Real

```bash
# Abrir Prisma Studio
npm run db:studio

# Ver tabla Prediccion
# Filtrar por puntosObtenidos != null

# Ver tabla User
# Ordenar por puntosTotal DESC
```

### Logs

El servidor muestra en consola:
- Partidos actualizados
- Predicciones procesadas
- Usuarios afectados
- Errores (si hay)

---

## 🎉 Estado Actual

- ✅ Algoritmo de puntuación implementado
- ✅ API de actualización de resultados
- ✅ API de recálculo masivo
- ✅ Panel admin funcional
- ✅ Script de simulación
- ✅ Cálculo automático al actualizar
- ✅ Actualización de totales
- ✅ Multiplicadores por fase
- ✅ Validaciones completas

---

## 🚀 Mejoras Futuras

1. **Notificaciones**
   - Avisar al usuario cuando gane puntos
   - Email resumen semanal

2. **Estadísticas Avanzadas**
   - Gráfica de puntos en el tiempo
   - Comparación con promedio
   - Racha de aciertos

3. **Automatización**
   - Integración con API de resultados reales
   - Actualización automática de partidos
   - Cron job para verificar resultados

4. **Admin Mejorado**
   - Confirmación antes de actualizar
   - Historial de cambios
   - Rollback de resultados
   - Permisos de admin (solo ciertos usuarios)

5. **Caché**
   - Cachear puntos calculados
   - Redis para rankings en tiempo real
