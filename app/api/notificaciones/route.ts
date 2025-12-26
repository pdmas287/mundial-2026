import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener notificaciones del usuario (últimas 50)
    const notificaciones = await prisma.notificacion.findMany({
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
      take: 50,
    })

    // Contar notificaciones no leídas
    const noLeidas = await prisma.notificacion.count({
      where: {
        userId: session.user.id,
        leida: false,
      },
    })

    return NextResponse.json({
      notificaciones,
      noLeidas,
    })
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al cargar notificaciones' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { notificacionId, marcarTodasLeidas } = body

    if (marcarTodasLeidas) {
      // Marcar todas como leídas
      await prisma.notificacion.updateMany({
        where: {
          userId: session.user.id,
          leida: false,
        },
        data: {
          leida: true,
        },
      })

      return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' })
    }

    if (notificacionId) {
      // Marcar una notificación específica como leída
      const notificacion = await prisma.notificacion.findUnique({
        where: { id: notificacionId },
      })

      if (!notificacion) {
        return NextResponse.json(
          { error: 'Notificación no encontrada' },
          { status: 404 }
        )
      }

      if (notificacion.userId !== session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }

      await prisma.notificacion.update({
        where: { id: notificacionId },
        data: { leida: true },
      })

      return NextResponse.json({ message: 'Notificación marcada como leída' })
    }

    return NextResponse.json(
      { error: 'Parámetros inválidos' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}
