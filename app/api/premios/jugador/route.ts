import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const POSICIONES_VALIDAS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const equipoId = body.equipoId
    const posicion = body.posicion

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    if (!POSICIONES_VALIDAS.includes(posicion)) {
      return NextResponse.json({ error: 'Posición inválida' }, { status: 400 })
    }

    const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 400 })
    }

    // Idempotencia: si ya existe un jugador con mismo nombre (case-insensitive)
    // y mismo equipo, devolverlo en lugar de duplicar.
    const existente = await prisma.jugador.findFirst({
      where: {
        equipoId,
        nombre: { equals: nombre, mode: 'insensitive' },
      },
    })

    if (existente) {
      return NextResponse.json(existente, { status: 200 })
    }

    const jugador = await prisma.jugador.create({
      data: { nombre, posicion, equipoId },
    })

    return NextResponse.json(jugador, { status: 201 })
  } catch (error) {
    console.error('Error al crear jugador personalizado:', error)
    return NextResponse.json({ error: 'Error al crear jugador' }, { status: 500 })
  }
}
