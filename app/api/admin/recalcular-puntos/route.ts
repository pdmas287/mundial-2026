import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { calcularPuntos } from '@/lib/puntuacion'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener todos los partidos finalizados
    const partidosFinalizados = await prisma.partido.findMany({
      where: {
        estado: 'FINALIZADO',
        golesLocal: { not: null },
        golesVisitante: { not: null },
      },
      include: {
        predicciones: true,
      },
    })

    let prediccionesActualizadas = 0
    const usuariosAfectados = new Set<string>()

    // Recalcular puntos para cada predicción
    for (const partido of partidosFinalizados) {
      for (const prediccion of partido.predicciones) {
        const puntos = calcularPuntos(
          {
            golesLocal: prediccion.golesLocal,
            golesVisitante: prediccion.golesVisitante,
          },
          {
            golesLocal: partido.golesLocal!,
            golesVisitante: partido.golesVisitante!,
          },
          partido.fase
        )

        await prisma.prediccion.update({
          where: { id: prediccion.id },
          data: { puntosObtenidos: puntos },
        })

        prediccionesActualizadas++
        usuariosAfectados.add(prediccion.userId)
      }
    }

    // Recalcular puntos totales de todos los usuarios afectados
    for (const userId of usuariosAfectados) {
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

      await prisma.user.update({
        where: { id: userId },
        data: { puntosTotal },
      })
    }

    return NextResponse.json({
      message: 'Puntos recalculados exitosamente',
      partidosFinalizados: partidosFinalizados.length,
      prediccionesActualizadas,
      usuariosActualizados: usuariosAfectados.size,
    })
  } catch (error) {
    console.error('Error al recalcular puntos:', error)
    return NextResponse.json(
      { error: 'Error al recalcular puntos' },
      { status: 500 }
    )
  }
}
