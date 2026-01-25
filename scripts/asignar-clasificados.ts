import { PrismaClient, Ronda } from '@prisma/client'
import {
  calcularTablaGrupo,
  obtenerClasificadosGrupo,
  calcularMejoresTerceros,
  fasesGruposCompletada,
} from '../lib/clasificacion'
import { asignarTercerosAPartidos } from '../lib/anexo-c'

const prisma = new PrismaClient()

/**
 * Script principal para asignar equipos clasificados a dieciseisavos de final
 * Se ejecuta cuando todos los partidos de la fase de grupos han finalizado
 */
async function asignarClasificados() {
  console.log('🏆 Iniciando asignación de clasificados a dieciseisavos de final...\n')

  try {
    // 1. Verificar que la fase de grupos esté completa
    const gruposCompletos = await fasesGruposCompletada()

    if (!gruposCompletos) {
      console.error('❌ La fase de grupos aún no ha finalizado')
      console.log('Por favor, asegúrate de que todos los partidos de grupos tengan resultado')
      process.exit(1)
    }

    console.log('✅ Fase de grupos completada\n')

    // 2. Calcular clasificados de cada grupo (1° y 2°)
    const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const clasificados: Record<string, { primero: string; segundo: string }> = {}

    console.log('📊 Calculando clasificados de cada grupo...\n')

    for (const grupo of grupos) {
      const { primero, segundo } = await obtenerClasificadosGrupo(grupo)

      clasificados[grupo] = {
        primero: primero.id,
        segundo: segundo.id,
      }

      console.log(`Grupo ${grupo}:`)
      console.log(`  1° ${primero.bandera} ${primero.nombre}`)
      console.log(`  2° ${segundo.bandera} ${segundo.nombre}\n`)
    }

    // 3. Calcular los 8 mejores terceros
    console.log('🥉 Calculando los 8 mejores terceros lugares...\n')

    const { mejoresTerceros, gruposClasificados } = await calcularMejoresTerceros()

    console.log('Terceros clasificados:')
    mejoresTerceros.forEach((tercero, index) => {
      console.log(
        `  ${index + 1}. Grupo ${tercero.equipo.grupo}: ${tercero.equipo.bandera} ${tercero.equipo.nombre} (${tercero.puntos} pts, DG: ${tercero.diferenciaGoles})`
      )
    })
    console.log('')

    // 4. Asignar terceros a partidos según Anexo C
    console.log('🗂️  Asignando terceros según Anexo C de FIFA...\n')

    const tercerosData = mejoresTerceros.map((t) => ({
      equipoId: t.equipo.id,
      grupo: t.equipo.grupo,
    }))

    const asignacionesTerceros = asignarTercerosAPartidos(tercerosData, gruposClasificados)

    // 5. Actualizar partidos de dieciseisavos con equipos clasificados
    console.log('⚽ Actualizando partidos de dieciseisavos...\n')

    // Partidos con 1° vs 2° (fijos)
    const partidosFijos = [
      { ronda: 'M73', local: clasificados['A'].segundo, visitante: clasificados['B'].segundo },
      { ronda: 'M75', local: clasificados['F'].primero, visitante: clasificados['C'].segundo },
      { ronda: 'M76', local: clasificados['C'].primero, visitante: clasificados['F'].segundo },
      { ronda: 'M78', local: clasificados['E'].segundo, visitante: clasificados['I'].segundo },
      { ronda: 'M83', local: clasificados['K'].segundo, visitante: clasificados['L'].segundo },
      { ronda: 'M84', local: clasificados['H'].primero, visitante: clasificados['J'].segundo },
      { ronda: 'M86', local: clasificados['J'].primero, visitante: clasificados['H'].segundo },
      { ronda: 'M88', local: clasificados['D'].segundo, visitante: clasificados['G'].segundo },
    ]

    // Partidos con 1° vs 3° (según Anexo C)
    const partidosConTerceros = [
      { ronda: 'M74', local: clasificados['E'].primero, visitante: asignacionesTerceros['M74'] },
      { ronda: 'M77', local: clasificados['I'].primero, visitante: asignacionesTerceros['M77'] },
      { ronda: 'M79', local: clasificados['A'].primero, visitante: asignacionesTerceros['M79'] },
      { ronda: 'M80', local: clasificados['L'].primero, visitante: asignacionesTerceros['M80'] },
      { ronda: 'M81', local: clasificados['D'].primero, visitante: asignacionesTerceros['M81'] },
      { ronda: 'M82', local: clasificados['G'].primero, visitante: asignacionesTerceros['M82'] },
      { ronda: 'M85', local: clasificados['B'].primero, visitante: asignacionesTerceros['M85'] },
      { ronda: 'M87', local: clasificados['K'].primero, visitante: asignacionesTerceros['M87'] },
    ]

    const todosLosPartidos = [...partidosFijos, ...partidosConTerceros]

    let partidosActualizados = 0

    for (const partido of todosLosPartidos) {
      const updated = await prisma.partido.updateMany({
        where: { ronda: partido.ronda as Ronda },
        data: {
          equipoLocalId: partido.local,
          equipoVisitanteId: partido.visitante,
        },
      })

      if (updated.count > 0) {
        // Obtener nombres de equipos para logging
        const local = await prisma.equipo.findUnique({ where: { id: partido.local } })
        const visitante = await prisma.equipo.findUnique({ where: { id: partido.visitante } })

        console.log(
          `  ${partido.ronda}: ${local?.bandera} ${local?.nombre} vs ${visitante?.bandera} ${visitante?.nombre}`
        )
        partidosActualizados++
      }
    }

    console.log(`\n✅ ${partidosActualizados} partidos de dieciseisavos actualizados con equipos clasificados`)
    console.log('\n🎉 Proceso completado exitosamente!')
    console.log('Los usuarios ya pueden ver los emparejamientos de dieciseisavos de final\n')
  } catch (error) {
    console.error('\n❌ Error al asignar clasificados:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar script
asignarClasificados()
  .then(() => {
    console.log('👋 Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
