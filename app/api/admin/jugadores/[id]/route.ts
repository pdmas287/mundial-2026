import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const POSICIONES_VALIDAS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      ),
    }
  }
  return { error: null }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const equipoId = typeof body.equipoId === 'string' ? body.equipoId : ''
    const posicion = body.posicion

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }
    if (nombre.length > 100) {
      return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 })
    }
    if (!equipoId) {
      return NextResponse.json({ error: 'El equipo es requerido' }, { status: 400 })
    }
    if (!POSICIONES_VALIDAS.includes(posicion)) {
      return NextResponse.json({ error: 'Posición inválida' }, { status: 400 })
    }

    const jugador = await prisma.jugador.findUnique({ where: { id: params.id } })
    if (!jugador) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 400 })
    }

    const actualizado = await prisma.jugador.update({
      where: { id: params.id },
      data: { nombre, equipoId, posicion },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error al editar jugador:', error)
    return NextResponse.json({ error: 'Error al editar jugador' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const jugador = await prisma.jugador.findUnique({ where: { id: params.id } })
    if (!jugador) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    const predicciones = await prisma.prediccionPremio.findMany({
      where: { jugadorId: params.id },
      include: { premio: true },
    })

    const result = await prisma.$transaction(async (tx) => {
      if (predicciones.length > 0) {
        await tx.notificacion.createMany({
          data: predicciones.map((p) => ({
            userId: p.userId,
            tipo: 'JUGADOR_ELIMINADO' as const,
            titulo: '🗑️ Jugador eliminado',
            mensaje: `El jugador "${jugador.nombre}" fue eliminado. Realiza una nueva predicción en ${p.premio.nombre}.`,
          })),
        })

        await tx.prediccionPremio.deleteMany({
          where: { jugadorId: params.id },
        })
      }

      await tx.jugador.delete({ where: { id: params.id } })

      return {
        jugadorEliminado: jugador.nombre,
        prediccionesEliminadas: predicciones.length,
        usuariosNotificados: predicciones.length,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al eliminar jugador:', error)
    return NextResponse.json({ error: 'Error al eliminar jugador' }, { status: 500 })
  }
}
