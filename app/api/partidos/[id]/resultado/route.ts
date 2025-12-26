import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'
import { calcularPuntos } from '@/lib/puntuacion'
import { notificarPuntosGanados, notificarResultadoPublicado } from '@/lib/notificaciones'

const resultadoSchema = z.object({
  golesLocal: z.number().min(0).max(20),
  golesVisitante: z.number().min(0).max(20),
  penalesLocal: z.number().min(0).max(20).optional(),
  penalesVisitante: z.number().min(0).max(20).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    // Solo usuarios autenticados pueden actualizar resultados
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Solo administradores pueden actualizar resultados
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = resultadoSchema.parse(body)

    // Obtener el partido
    const partido = await prisma.partido.findUnique({
      where: { id: params.id },
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

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar resultado del partido
    const partidoActualizado = await prisma.partido.update({
      where: { id: params.id },
      data: {
        golesLocal: validatedData.golesLocal,
        golesVisitante: validatedData.golesVisitante,
        penalesLocal: validatedData.penalesLocal,
        penalesVisitante: validatedData.penalesVisitante,
        estado: 'FINALIZADO',
      },
    })

    // Calcular puntos para cada predicción
    const prediccionesActualizadas = []
    const usuariosActualizados = new Set<string>()

    const equipoLocal = partido.equipoLocal?.nombre || 'TBD'
    const equipoVisitante = partido.equipoVisitante?.nombre || 'TBD'

    for (const prediccion of partido.predicciones) {
      const puntos = calcularPuntos(
        {
          golesLocal: prediccion.golesLocal,
          golesVisitante: prediccion.golesVisitante,
        },
        {
          golesLocal: validatedData.golesLocal,
          golesVisitante: validatedData.golesVisitante,
        },
        partido.fase
      )

      // Actualizar predicción con puntos
      const prediccionActualizada = await prisma.prediccion.update({
        where: { id: prediccion.id },
        data: {
          puntosObtenidos: puntos,
        },
      })

      prediccionesActualizadas.push(prediccionActualizada)
      usuariosActualizados.add(prediccion.userId)

      // Crear notificación de puntos ganados
      await notificarPuntosGanados(
        prediccion.userId,
        puntos,
        partido.id,
        equipoLocal,
        equipoVisitante
      )

      // Crear notificación de resultado publicado (solo una por usuario)
      await notificarResultadoPublicado(
        prediccion.userId,
        partido.id,
        equipoLocal,
        equipoVisitante,
        `${validatedData.golesLocal}-${validatedData.golesVisitante}`
      )
    }

    // Recalcular puntos totales de cada usuario afectado
    for (const userId of usuariosActualizados) {
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
      message: 'Resultado actualizado y puntos calculados exitosamente',
      partido: partidoActualizado,
      prediccionesActualizadas: prediccionesActualizadas.length,
      usuariosActualizados: usuariosActualizados.size,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar resultado:', error)
    return NextResponse.json(
      { error: 'Error al actualizar resultado' },
      { status: 500 }
    )
  }
}
