import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Fase } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const grupo = searchParams.get('grupo')
    const fase = searchParams.get('fase') as Fase | null
    const todas = searchParams.get('todas') === 'true' // Para admin: ver todos los partidos

    // Construir filtro de fase
    const faseFilter = todas
      ? {} // Sin filtro de fase - mostrar todos
      : fase
        ? { fase }
        : { fase: 'GRUPOS' as Fase } // Por defecto solo grupos

    // Obtener partidos con equipos y predicciones del usuario si está logueado
    const partidos = await prisma.partido.findMany({
      where: {
        ...faseFilter,
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
