import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener partidos de fase eliminatoria
    const partidos = await prisma.partido.findMany({
      where: {
        fase: {
          in: ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL'],
        },
      },
      include: {
        equipoLocal: true,
        equipoVisitante: true,
        predicciones: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' },
      ],
    })

    // Agrupar por fase
    const brackets = {
      OCTAVOS: partidos.filter((p) => p.fase === 'OCTAVOS'),
      CUARTOS: partidos.filter((p) => p.fase === 'CUARTOS'),
      SEMIFINAL: partidos.filter((p) => p.fase === 'SEMIFINAL'),
      TERCER_PUESTO: partidos.filter((p) => p.fase === 'TERCER_PUESTO'),
      FINAL: partidos.filter((p) => p.fase === 'FINAL'),
    }

    // Obtener estadísticas del usuario en eliminatorias
    const prediccionesEliminatorias = await prisma.prediccion.findMany({
      where: {
        userId: session.user.id,
        partido: {
          fase: {
            in: ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL'],
          },
        },
      },
      include: {
        partido: true,
      },
    })

    const estadisticas = {
      totalPredicciones: prediccionesEliminatorias.length,
      prediccionesAcertadas: prediccionesEliminatorias.filter(
        (p) => p.puntosObtenidos && p.puntosObtenidos >= 5
      ).length,
      puntosEliminatorias: prediccionesEliminatorias.reduce(
        (sum, p) => sum + (p.puntosObtenidos || 0),
        0
      ),
    }

    return NextResponse.json({
      brackets,
      estadisticas,
    })
  } catch (error) {
    console.error('Error al cargar brackets:', error)
    return NextResponse.json(
      { error: 'Error al cargar brackets' },
      { status: 500 }
    )
  }
}
