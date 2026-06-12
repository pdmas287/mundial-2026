import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Esta ruta usa la sesión (headers), por lo que siempre se renderiza dinámicamente
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const jugadores = await prisma.jugador.findMany({
      orderBy: [{ esPersonalizado: 'desc' }, { nombre: 'asc' }],
      include: { _count: { select: { predicciones: true } } },
    })

    const equipos = await prisma.equipo.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, bandera: true },
    })

    return NextResponse.json({ jugadores, equipos })
  } catch (error) {
    console.error('Error al obtener jugadores:', error)
    return NextResponse.json({ error: 'Error al obtener jugadores' }, { status: 500 })
  }
}
