import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updatePerfilSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  avatar: z.string().optional(),
  passwordActual: z.string().optional(),
  passwordNuevo: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener información del usuario
    const usuario = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        avatar: true,
        role: true,
        puntosTotal: true,
        createdAt: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener todas las predicciones del usuario
    const predicciones = await prisma.prediccion.findMany({
      where: { userId: session.user.id },
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

    // Calcular estadísticas generales
    const totalPredicciones = predicciones.length
    const prediccionesEvaluadas = predicciones.filter(
      (p) => p.puntosObtenidos !== null
    ).length
    const prediccionesExactas = predicciones.filter(
      (p) => p.puntosObtenidos && p.puntosObtenidos >= 5
    ).length
    const prediccionesParciales = predicciones.filter(
      (p) => p.puntosObtenidos && p.puntosObtenidos > 0 && p.puntosObtenidos < 5
    ).length
    const prediccionesFalladas = predicciones.filter(
      (p) => p.puntosObtenidos === 0
    ).length

    const tasaAcierto =
      prediccionesEvaluadas > 0
        ? ((prediccionesExactas / prediccionesEvaluadas) * 100).toFixed(1)
        : '0.0'

    // Estadísticas por fase
    const fases = ['GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'TERCER_PUESTO', 'FINAL']
    const estadisticasPorFase = fases.map((fase) => {
      const prediccionesFase = predicciones.filter(
        (p) => p.partido.fase === fase && p.puntosObtenidos !== null
      )
      const puntosFase = prediccionesFase.reduce(
        (sum, p) => sum + (p.puntosObtenidos || 0),
        0
      )
      const aciertos = prediccionesFase.filter(
        (p) => p.puntosObtenidos && p.puntosObtenidos >= 5
      ).length

      return {
        fase,
        predicciones: prediccionesFase.length,
        aciertos,
        puntos: puntosFase,
      }
    })

    // Obtener posición en el ranking
    const usuariosConMayorPuntuacion = await prisma.user.count({
      where: {
        puntosTotal: {
          gt: usuario.puntosTotal,
        },
      },
    })
    const posicionRanking = usuariosConMayorPuntuacion + 1

    // Total de usuarios
    const totalUsuarios = await prisma.user.count()

    // Predicciones de premios
    const prediccionesPremios = await prisma.prediccionPremio.findMany({
      where: { userId: session.user.id },
      include: {
        premio: true,
        jugador: true,
      },
    })

    // Obtener equipos para las predicciones que tienen equipoId
    const equipoIds = prediccionesPremios
      .filter((p) => p.equipoId)
      .map((p) => p.equipoId as string)

    const equipos = equipoIds.length > 0
      ? await prisma.equipo.findMany({
          where: { id: { in: equipoIds } },
        })
      : []

    // Mapear predicciones con datos de equipo
    const prediccionesPremiosConEquipo = prediccionesPremios.map((pred) => ({
      ...pred,
      equipo: pred.equipoId
        ? equipos.find((e) => e.id === pred.equipoId) || null
        : null,
    }))

    // Historial reciente (últimas 20 predicciones)
    const historialReciente = predicciones.slice(0, 20).map((p) => ({
      id: p.id,
      fecha: p.partido.fecha,
      fase: p.partido.fase,
      equipoLocal: p.partido.equipoLocal?.nombre || 'TBD',
      banderaLocal: p.partido.equipoLocal?.bandera || '❓',
      equipoVisitante: p.partido.equipoVisitante?.nombre || 'TBD',
      banderaVisitante: p.partido.equipoVisitante?.bandera || '❓',
      prediccionLocal: p.golesLocal,
      prediccionVisitante: p.golesVisitante,
      resultadoLocal: p.partido.golesLocal,
      resultadoVisitante: p.partido.golesVisitante,
      puntosObtenidos: p.puntosObtenidos,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({
      usuario,
      estadisticas: {
        totalPredicciones,
        prediccionesEvaluadas,
        prediccionesExactas,
        prediccionesParciales,
        prediccionesFalladas,
        tasaAcierto: parseFloat(tasaAcierto),
        posicionRanking,
        totalUsuarios,
      },
      estadisticasPorFase,
      prediccionesPremios: prediccionesPremiosConEquipo,
      historialReciente,
    })
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    return NextResponse.json(
      { error: 'Error al cargar perfil' },
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
    const validacion = updatePerfilSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre, avatar, passwordActual, passwordNuevo } = validacion.data

    // Si se quiere cambiar la contraseña, validar la actual
    if (passwordNuevo) {
      if (!passwordActual) {
        return NextResponse.json(
          { error: 'Debes proporcionar tu contraseña actual' },
          { status: 400 }
        )
      }

      const usuario = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      })

      if (!usuario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }

      const passwordValida = await bcrypt.compare(passwordActual, usuario.password)

      if (!passwordValida) {
        return NextResponse.json(
          { error: 'La contraseña actual es incorrecta' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(passwordNuevo, 10)

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          nombre,
          avatar,
          password: hashedPassword,
        },
      })
    } else {
      // Solo actualizar nombre y avatar
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          nombre,
          avatar,
        },
      })
    }

    return NextResponse.json({ message: 'Perfil actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
