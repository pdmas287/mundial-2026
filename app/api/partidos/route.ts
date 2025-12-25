import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const grupo = searchParams.get('grupo')

    // Obtener partidos con equipos y predicciones del usuario si está logueado
    const partidos = await prisma.partido.findMany({
      where: {
        fase: 'GRUPOS',
        ...(grupo && grupo !== 'TODOS' ? { grupo } : {}),
      },
      include: {
        equipoLocal: true,
        equipoVisitante: true,
        ...(session?.user?.id
          ? {
              predicciones: {
                where: {
                  userId: session.user.id,
                },
              },
            }
          : {}),
      },
      orderBy: [
        { fecha: 'asc' },
        { grupo: 'asc' },
      ],
    })

    return NextResponse.json(partidos)
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    )
  }
}
