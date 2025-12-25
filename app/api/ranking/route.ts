import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Obtener ranking de usuarios
    const usuarios = await prisma.user.findMany({
      where: search
        ? {
            nombre: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {},
      select: {
        id: true,
        nombre: true,
        email: true,
        avatar: true,
        puntosTotal: true,
        createdAt: true,
        predicciones: {
          where: {
            puntosObtenidos: { not: null },
          },
          select: {
            puntosObtenidos: true,
            partido: {
              select: {
                fase: true,
              },
            },
          },
        },
      },
      orderBy: {
        puntosTotal: 'desc',
      },
      take: limit,
    })

    // Calcular estadísticas para cada usuario
    const ranking = usuarios.map((usuario, index) => {
      const prediccionesRealizadas = usuario.predicciones.length
      const prediccionesAcertadas = usuario.predicciones.filter(
        (p) => p.puntosObtenidos && p.puntosObtenidos >= 5
      ).length
      const prediccionesParcialesAcertadas = usuario.predicciones.filter(
        (p) => p.puntosObtenidos && p.puntosObtenidos >= 2 && p.puntosObtenidos < 5
      ).length

      const tasaAcierto =
        prediccionesRealizadas > 0
          ? ((prediccionesAcertadas / prediccionesRealizadas) * 100).toFixed(1)
          : '0.0'

      // Puntos por fase
      const puntosPorFase = usuario.predicciones.reduce(
        (acc, p) => {
          const fase = p.partido.fase
          acc[fase] = (acc[fase] || 0) + (p.puntosObtenidos || 0)
          return acc
        },
        {} as Record<string, number>
      )

      return {
        posicion: index + 1,
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        avatar: usuario.avatar,
        puntosTotal: usuario.puntosTotal,
        prediccionesRealizadas,
        prediccionesAcertadas,
        prediccionesParcialesAcertadas,
        tasaAcierto: parseFloat(tasaAcierto),
        puntosPorFase,
        esUsuarioActual: usuario.id === session.user.id,
      }
    })

    // Obtener posición del usuario actual si no está en el top
    const usuarioActual = ranking.find((u) => u.esUsuarioActual)
    let posicionUsuario = null

    if (!usuarioActual) {
      const posicion = await prisma.user.count({
        where: {
          puntosTotal: {
            gt: session.user.puntosTotal || 0,
          },
        },
      })

      const datosUsuario = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          nombre: true,
          email: true,
          avatar: true,
          puntosTotal: true,
          predicciones: {
            where: {
              puntosObtenidos: { not: null },
            },
            select: {
              puntosObtenidos: true,
              partido: {
                select: {
                  fase: true,
                },
              },
            },
          },
        },
      })

      if (datosUsuario) {
        const prediccionesRealizadas = datosUsuario.predicciones.length
        const prediccionesAcertadas = datosUsuario.predicciones.filter(
          (p) => p.puntosObtenidos && p.puntosObtenidos >= 5
        ).length
        const prediccionesParcialesAcertadas = datosUsuario.predicciones.filter(
          (p) => p.puntosObtenidos && p.puntosObtenidos >= 2 && p.puntosObtenidos < 5
        ).length

        const tasaAcierto =
          prediccionesRealizadas > 0
            ? ((prediccionesAcertadas / prediccionesRealizadas) * 100).toFixed(1)
            : '0.0'

        const puntosPorFase = datosUsuario.predicciones.reduce(
          (acc, p) => {
            const fase = p.partido.fase
            acc[fase] = (acc[fase] || 0) + (p.puntosObtenidos || 0)
            return acc
          },
          {} as Record<string, number>
        )

        posicionUsuario = {
          posicion: posicion + 1,
          id: datosUsuario.id,
          nombre: datosUsuario.nombre,
          email: datosUsuario.email,
          avatar: datosUsuario.avatar,
          puntosTotal: datosUsuario.puntosTotal,
          prediccionesRealizadas,
          prediccionesAcertadas,
          prediccionesParcialesAcertadas,
          tasaAcierto: parseFloat(tasaAcierto),
          puntosPorFase,
          esUsuarioActual: true,
        }
      }
    }

    return NextResponse.json({
      ranking,
      usuarioActual: usuarioActual || posicionUsuario,
      totalUsuarios: await prisma.user.count(),
    })
  } catch (error) {
    console.error('Error al obtener ranking:', error)
    return NextResponse.json(
      { error: 'Error al obtener ranking' },
      { status: 500 }
    )
  }
}
