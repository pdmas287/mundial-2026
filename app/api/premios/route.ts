import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener todos los premios
    const premios = await prisma.premio.findMany({
      orderBy: { tipo: 'asc' },
    })

    // Obtener las predicciones del usuario para estos premios
    const predicciones = await prisma.prediccionPremio.findMany({
      where: { userId: session.user.id },
      include: {
        jugador: true,
      },
    })

    // Obtener jugadores para los premios de jugador
    const jugadores = await prisma.jugador.findMany({
      orderBy: { nombre: 'asc' },
    })

    // Obtener equipos para premios de equipo
    const equipos = await prisma.equipo.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({
      premios,
      predicciones,
      jugadores,
      equipos,
    })
  } catch (error) {
    console.error('Error al obtener premios:', error)
    return NextResponse.json(
      { error: 'Error al obtener premios' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { premioId, jugadorId, equipoId } = await request.json()

    if (!premioId) {
      return NextResponse.json(
        { error: 'premioId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el premio existe
    const premio = await prisma.premio.findUnique({
      where: { id: premioId },
    })

    if (!premio) {
      return NextResponse.json(
        { error: 'Premio no encontrado' },
        { status: 404 }
      )
    }

    // Validar que se proporcione jugadorId o equipoId según el tipo de premio
    if (
      ['BALON_ORO', 'BOTA_ORO', 'GUANTE_ORO'].includes(premio.tipo) &&
      !jugadorId
    ) {
      return NextResponse.json(
        { error: 'jugadorId es requerido para este tipo de premio' },
        { status: 400 }
      )
    }

    if (
      ['CAMPEON', 'SUBCAMPEON'].includes(premio.tipo) &&
      !equipoId
    ) {
      return NextResponse.json(
        { error: 'equipoId es requerido para este tipo de premio' },
        { status: 400 }
      )
    }

    // Crear o actualizar la predicción
    const prediccion = await prisma.prediccionPremio.upsert({
      where: {
        userId_premioId: {
          userId: session.user.id,
          premioId,
        },
      },
      update: {
        jugadorId,
        equipoId,
      },
      create: {
        userId: session.user.id,
        premioId,
        jugadorId,
        equipoId,
      },
      include: {
        jugador: true,
      },
    })

    return NextResponse.json(prediccion)
  } catch (error) {
    console.error('Error al guardar predicción de premio:', error)
    return NextResponse.json(
      { error: 'Error al guardar predicción' },
      { status: 500 }
    )
  }
}
