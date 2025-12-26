import { prisma } from './prisma'
import { TipoNotificacion } from '@prisma/client'

interface CrearNotificacionParams {
  userId: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  partidoId?: string
  puntos?: number
}

export async function crearNotificacion(params: CrearNotificacionParams) {
  try {
    await prisma.notificacion.create({
      data: {
        userId: params.userId,
        tipo: params.tipo,
        titulo: params.titulo,
        mensaje: params.mensaje,
        partidoId: params.partidoId,
        puntos: params.puntos,
      },
    })
  } catch (error) {
    console.error('Error al crear notificación:', error)
  }
}

export async function notificarPuntosGanados(
  userId: string,
  puntos: number,
  partidoId: string,
  equipoLocal: string,
  equipoVisitante: string
) {
  const mensaje =
    puntos >= 5
      ? `¡Predicción exacta! ${equipoLocal} vs ${equipoVisitante}`
      : puntos > 0
      ? `Predicción parcial en ${equipoLocal} vs ${equipoVisitante}`
      : `Sin puntos en ${equipoLocal} vs ${equipoVisitante}`

  await crearNotificacion({
    userId,
    tipo: 'PUNTOS_GANADOS',
    titulo: puntos > 0 ? '🎉 ¡Ganaste puntos!' : '😢 Sin puntos',
    mensaje,
    partidoId,
    puntos,
  })
}

export async function notificarResultadoPublicado(
  userId: string,
  partidoId: string,
  equipoLocal: string,
  equipoVisitante: string,
  resultado: string
) {
  await crearNotificacion({
    userId,
    tipo: 'RESULTADO_PARTIDO',
    titulo: '📊 Resultado publicado',
    mensaje: `${equipoLocal} ${resultado} ${equipoVisitante}`,
    partidoId,
  })
}

export async function notificarPartidoProximo(
  userId: string,
  partidoId: string,
  equipoLocal: string,
  equipoVisitante: string,
  minutos: number
) {
  const tiempo = minutos < 60 ? `${minutos} minutos` : `${Math.floor(minutos / 60)} hora(s)`

  await crearNotificacion({
    userId,
    tipo: 'PARTIDO_PROXIMO',
    titulo: '⏰ Partido por empezar',
    mensaje: `${equipoLocal} vs ${equipoVisitante} en ${tiempo}`,
    partidoId,
  })
}

export async function notificarPremioAcertado(
  userId: string,
  premioNombre: string,
  ganador: string
) {
  await crearNotificacion({
    userId,
    tipo: 'PREMIO_ACERTADO',
    titulo: '🏆 ¡Premio acertado!',
    mensaje: `Acertaste ${premioNombre}: ${ganador}`,
  })
}
