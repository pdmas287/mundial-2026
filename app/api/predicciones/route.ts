import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const prediccionSchema = z.object({
  partidoId: z.string(),
  golesLocal: z.number().min(0).max(20),
  golesVisitante: z.number().min(0).max(20),
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

    // Verificar que el partido no ha comenzado
    if (new Date() >= partido.fecha) {
      return NextResponse.json(
        { error: 'No se puede predecir un partido que ya comenzó' },
        { status: 400 }
      )
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
      },
      create: {
        userId: session.user.id,
        partidoId: validatedData.partidoId,
        golesLocal: validatedData.golesLocal,
        golesVisitante: validatedData.golesVisitante,
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
