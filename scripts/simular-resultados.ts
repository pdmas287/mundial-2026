/**
 * Script para simular resultados de partidos (solo para testing)
 *
 * Uso:
 * npx tsx scripts/simular-resultados.ts
 */

import { PrismaClient } from '@prisma/client'
import { calcularPuntos } from '../lib/puntuacion'

const prisma = new PrismaClient()

async function main() {
  console.log('🎲 Simulando resultados de partidos...\n')

  // Obtener los primeros 5 partidos
  const partidos = await prisma.partido.findMany({
    take: 5,
    orderBy: { fecha: 'asc' },
    include: {
      equipoLocal: true,
      equipoVisitante: true,
      predicciones: {
        include: {
          user: true,
        },
      },
    },
  })

  console.log(`📊 Procesando ${partidos.length} partidos...\n`)

  const usuariosActualizados = new Set<string>()

  for (const partido of partidos) {
    // Saltar partidos sin equipos asignados
    if (!partido.equipoLocal || !partido.equipoVisitante) {
      console.log(`⏭️  Partido ${partido.id} sin equipos asignados, saltando...`)
      continue
    }

    // Generar resultado aleatorio
    const golesLocal = Math.floor(Math.random() * 5)
    const golesVisitante = Math.floor(Math.random() * 5)

    console.log(`⚽ ${partido.equipoLocal.bandera} ${partido.equipoLocal.nombre} ${golesLocal} - ${golesVisitante} ${partido.equipoVisitante.nombre} ${partido.equipoVisitante.bandera}`)

    // Actualizar resultado del partido
    await prisma.partido.update({
      where: { id: partido.id },
      data: {
        golesLocal,
        golesVisitante,
        estado: 'FINALIZADO',
      },
    })

    // Calcular puntos para cada predicción
    let prediccionesConPuntos = 0
    for (const prediccion of partido.predicciones) {
      const puntos = calcularPuntos(
        {
          golesLocal: prediccion.golesLocal,
          golesVisitante: prediccion.golesVisitante,
        },
        {
          golesLocal,
          golesVisitante,
        },
        partido.fase
      )

      await prisma.prediccion.update({
        where: { id: prediccion.id },
        data: { puntosObtenidos: puntos },
      })

      if (puntos > 0) {
        prediccionesConPuntos++
      }

      usuariosActualizados.add(prediccion.userId)

      console.log(`  ├─ ${prediccion.user.nombre}: predicción ${prediccion.golesLocal}-${prediccion.golesVisitante} → ${puntos} pts`)
    }

    console.log(`  └─ ${partido.predicciones.length} predicciones procesadas (${prediccionesConPuntos} con puntos)\n`)
  }

  // Recalcular puntos totales de usuarios
  console.log('🔄 Recalculando puntos totales...\n')

  for (const userId of Array.from(usuariosActualizados)) {
    const todasLasPredicciones = await prisma.prediccion.findMany({
      where: {
        userId,
        puntosObtenidos: { not: null },
      },
    })

    const puntosTotal = todasLasPredicciones.reduce(
      (sum, p) => sum + (p.puntosObtenidos || 0),
      0
    )

    const user = await prisma.user.update({
      where: { id: userId },
      data: { puntosTotal },
      select: {
        nombre: true,
        puntosTotal: true,
      },
    })

    console.log(`  ✓ ${user.nombre}: ${user.puntosTotal} puntos totales`)
  }

  console.log(`\n✅ Simulación completada!`)
  console.log(`   - ${partidos.length} partidos finalizados`)
  console.log(`   - ${usuariosActualizados.size} usuarios actualizados`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
