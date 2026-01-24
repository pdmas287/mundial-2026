import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const prediccionSchema = z.object({
  partidoId: z.string(),
  golesLocal: z.number().min(0).max(20),
  golesVisitante: z.number().min(0).max(20),
  // Penales opcionales (solo para eliminatorias cuando se predice empate)
  penalesLocal: z.number().min(0).max(20).optional().nullable(),
  penalesVisitante: z.number().min(0).max(20).optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = prediccionSchema.parse(body)

    // Verificar que el partido existe y no ha comenzado
    const partido = await prisma.partido.findUnique({
      where: { id: validatedData.partidoId },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que las predicciones no están cerradas (1 hora antes del partido)
    const ahora = new Date()
    const cierrePredicciones = new Date(partido.fecha.getTime() - 60 * 60 * 1000) // 1 hora antes

    if (ahora >= partido.fecha) {
      return NextResponse.json(
        { error: 'No se puede predecir un partido que ya comenzó' },
        { status: 400 }
      )
    }

    if (ahora >= cierrePredicciones) {
      return NextResponse.json(
        { error: 'Las predicciones para este partido se cerraron 1 hora antes del inicio' },
        { status: 400 }
      )
    }

    // Validar penales: solo permitir si es eliminatoria y predice empate
    const esEliminatoria = partido.fase !== 'GRUPOS'
    const prediceEmpate = validatedData.golesLocal === validatedData.golesVisitante
    const incluyePenales = validatedData.penalesLocal != null && validatedData.penalesVisitante != null

    // Si predice empate en eliminatoria, debe incluir penales
    if (esEliminatoria && prediceEmpate && !incluyePenales) {
      return NextResponse.json(
        { error: 'En eliminatorias, si predices empate debes incluir el resultado de penales' },
        { status: 400 }
      )
    }

    // Limpiar penales si no aplican (no es empate o no es eliminatoria)
    const penalesData = esEliminatoria && prediceEmpate
      ? {
          penalesLocal: validatedData.penalesLocal,
          penalesVisitante: validatedData.penalesVisitante,
        }
      : {
          penalesLocal: null,
          penalesVisitante: null,
        }

    // Crear o actualizar predicción
    const prediccion = await prisma.prediccion.upsert({
      where: {
        userId_partidoId: {
          userId: session.user.id,
          partidoId: validatedData.partidoId,
        },
      },
      update: {
        golesLocal: validatedData.golesLocal,
        golesVisitante: validatedData.golesVisitante,
        ...penalesData,
      },
      create: {
        userId: session.user.id,
        partidoId: validatedData.partidoId,
        golesLocal: validatedData.golesLocal,
        golesVisitante: validatedData.golesVisitante,
        ...penalesData,
      },
    })

    return NextResponse.json({
      message: 'Predicción guardada exitosamente',
      prediccion,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al guardar predicción:', error)
    return NextResponse.json(
      { error: 'Error al guardar predicción' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const predicciones = await prisma.prediccion.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        partido: {
          include: {
            equipoLocal: true,
            equipoVisitante: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(predicciones)
  } catch (error) {
    console.error('Error al obtener predicciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener predicciones' },
      { status: 500 }
    )
  }
}
