import { PrismaClient } from '@prisma/client'
import { notificarPartidoProximo } from '../lib/notificaciones'

const prisma = new PrismaClient()

async function enviarRecordatoriosPartidos() {
  console.log('🔔 Iniciando envío de recordatorios de partidos...')

  try {
    const ahora = new Date()

    // Buscar partidos que empiezan en las próximas 2 horas
    const dosHorasAdelante = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)

    const partidosProximos = await prisma.partido.findMany({
      where: {
        fecha: {
          gte: ahora,
          lte: dosHorasAdelante,
        },
        estado: 'PENDIENTE',
      },
      include: {
        equipoLocal: true,
        equipoVisitante: true,
        predicciones: {
          select: {
            userId: true,
          },
        },
      },
    })

    console.log(`📊 Encontrados ${partidosProximos.length} partidos próximos`)

    let notificacionesEnviadas = 0

    for (const partido of partidosProximos) {
      const tiempoRestante = partido.fecha.getTime() - ahora.getTime()
      const minutosRestantes = Math.floor(tiempoRestante / 60000)

      // Solo notificar si faltan exactamente 2 horas, 1 hora o 30 minutos
      const debeNotificar =
        (minutosRestantes >= 115 && minutosRestantes <= 125) || // ~2 horas
        (minutosRestantes >= 55 && minutosRestantes <= 65) ||   // ~1 hora
        (minutosRestantes >= 25 && minutosRestantes <= 35)      // ~30 minutos

      if (!debeNotificar) {
        continue
      }

      const equipoLocal = partido.equipoLocal?.nombre || 'TBD'
      const equipoVisitante = partido.equipoVisitante?.nombre || 'TBD'

      console.log(`⚽ Partido: ${equipoLocal} vs ${equipoVisitante} (en ${minutosRestantes} min)`)

      // Verificar si ya se envió notificación reciente para este partido
      const yaNotificado = await prisma.notificacion.findFirst({
        where: {
          partidoId: partido.id,
          tipo: 'PARTIDO_PROXIMO',
          createdAt: {
            gte: new Date(ahora.getTime() - 10 * 60 * 1000), // Últimos 10 minutos
          },
        },
      })

      if (yaNotificado) {
        console.log(`  ⏭️  Ya se notificó recientemente, saltando...`)
        continue
      }

      // Obtener usuarios con predicciones para este partido
      const usuariosConPredicciones = new Set(
        partido.predicciones.map((p) => p.userId)
      )

      // Si no hay predicciones, obtener todos los usuarios activos
      let usuarios = []
      if (usuariosConPredicciones.size > 0) {
        usuarios = Array.from(usuariosConPredicciones).map((id) => ({ id }))
      } else {
        // Notificar a todos los usuarios
        const todosUsuarios = await prisma.user.findMany({
          select: { id: true },
        })
        usuarios = todosUsuarios
      }

      // Enviar notificación a cada usuario
      for (const usuario of usuarios) {
        await notificarPartidoProximo(
          usuario.id,
          partido.id,
          equipoLocal,
          equipoVisitante,
          minutosRestantes
        )
        notificacionesEnviadas++
      }

      console.log(`  ✅ Enviadas ${usuarios.length} notificaciones`)
    }

    console.log(`\n✨ Proceso completado: ${notificacionesEnviadas} notificaciones enviadas`)
  } catch (error) {
    console.error('❌ Error al enviar recordatorios:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
enviarRecordatoriosPartidos()
  .then(() => {
    console.log('👋 Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
