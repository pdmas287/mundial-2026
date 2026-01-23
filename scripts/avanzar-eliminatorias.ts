import { PrismaClient, Fase } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Mapeo de partidos: define qué ganadores avanzan a qué partidos
 * Formato: { rondaDestino: [rondaGanador1, rondaGanador2] }
 */

// Dieciseisavos (M73-M88) -> Octavos (M89-M96)
const DIECISEISAVOS_A_OCTAVOS: Record<string, [string, string]> = {
  'M89': ['M73', 'M75'],  // W73 vs W75
  'M90': ['M74', 'M77'],  // W74 vs W77
  'M91': ['M76', 'M78'],  // W76 vs W78
  'M92': ['M79', 'M80'],  // W79 vs W80
  'M93': ['M81', 'M82'],  // W81 vs W82
  'M94': ['M83', 'M84'],  // W83 vs W84
  'M95': ['M85', 'M86'],  // W85 vs W86
  'M96': ['M87', 'M88'],  // W87 vs W88
}

// Octavos (M89-M96) -> Cuartos (M97-M100)
const OCTAVOS_A_CUARTOS: Record<string, [string, string]> = {
  'M97': ['M89', 'M90'],  // W89 vs W90
  'M98': ['M91', 'M92'],  // W91 vs W92
  'M99': ['M93', 'M94'],  // W93 vs W94
  'M100': ['M95', 'M96'], // W95 vs W96
}

// Cuartos (M97-M100) -> Semifinales (M101-M102)
const CUARTOS_A_SEMIFINALES: Record<string, [string, string]> = {
  'M101': ['M97', 'M98'],   // W97 vs W98
  'M102': ['M99', 'M100'],  // W99 vs W100
}

// Semifinales (M101-M102) -> Final (M104) y Tercer Puesto (M103)
// En semifinales, los ganadores van a la final y los perdedores al tercer puesto
const SEMIFINALES_A_FINAL: Record<string, [string, string]> = {
  'M104': ['M101', 'M102'],  // W101 vs W102 (Final)
}

const SEMIFINALES_A_TERCER_PUESTO: Record<string, [string, string]> = {
  'M103': ['M101', 'M102'],  // L101 vs L102 (Tercer Puesto)
}

/**
 * Obtiene el ganador de un partido finalizado
 * En eliminatorias, si hay empate se considera penales (golesLocalPenales, golesVisitantePenales)
 */
async function obtenerGanador(ronda: string): Promise<string | null> {
  const partido = await prisma.partido.findFirst({
    where: { ronda },
    include: {
      equipoLocal: true,
      equipoVisitante: true,
    },
  })

  if (!partido) {
    console.error(`  ❌ Partido ${ronda} no encontrado`)
    return null
  }

  if (partido.estado !== 'FINALIZADO') {
    console.log(`  ⏳ Partido ${ronda} no ha finalizado aún`)
    return null
  }

  if (partido.golesLocal === null || partido.golesVisitante === null) {
    console.error(`  ❌ Partido ${ronda} no tiene resultado`)
    return null
  }

  if (!partido.equipoLocal || !partido.equipoVisitante) {
    console.error(`  ❌ Partido ${ronda} no tiene equipos asignados`)
    return null
  }

  // Determinar ganador
  if (partido.golesLocal > partido.golesVisitante) {
    return partido.equipoLocalId!
  } else if (partido.golesVisitante > partido.golesLocal) {
    return partido.equipoVisitanteId!
  } else {
    // Empate - verificar penales
    if (partido.penalesLocal !== null && partido.penalesVisitante !== null) {
      if (partido.penalesLocal > partido.penalesVisitante) {
        return partido.equipoLocalId!
      } else if (partido.penalesVisitante > partido.penalesLocal) {
        return partido.equipoVisitanteId!
      }
    }
    console.error(`  ❌ Partido ${ronda} terminó en empate sin definición por penales`)
    return null
  }
}

/**
 * Obtiene el perdedor de un partido finalizado (para tercer puesto)
 */
async function obtenerPerdedor(ronda: string): Promise<string | null> {
  const partido = await prisma.partido.findFirst({
    where: { ronda },
    include: {
      equipoLocal: true,
      equipoVisitante: true,
    },
  })

  if (!partido) {
    console.error(`  ❌ Partido ${ronda} no encontrado`)
    return null
  }

  if (partido.estado !== 'FINALIZADO') {
    console.log(`  ⏳ Partido ${ronda} no ha finalizado aún`)
    return null
  }

  if (partido.golesLocal === null || partido.golesVisitante === null) {
    console.error(`  ❌ Partido ${ronda} no tiene resultado`)
    return null
  }

  if (!partido.equipoLocal || !partido.equipoVisitante) {
    console.error(`  ❌ Partido ${ronda} no tiene equipos asignados`)
    return null
  }

  // Determinar perdedor
  if (partido.golesLocal > partido.golesVisitante) {
    return partido.equipoVisitanteId!
  } else if (partido.golesVisitante > partido.golesLocal) {
    return partido.equipoLocalId!
  } else {
    // Empate - verificar penales
    if (partido.penalesLocal !== null && partido.penalesVisitante !== null) {
      if (partido.penalesLocal > partido.penalesVisitante) {
        return partido.equipoVisitanteId!
      } else if (partido.penalesVisitante > partido.penalesLocal) {
        return partido.equipoLocalId!
      }
    }
    console.error(`  ❌ Partido ${ronda} terminó en empate sin definición por penales`)
    return null
  }
}

/**
 * Verifica si todos los partidos de una fase han finalizado
 */
async function verificarFaseCompleta(fase: Fase): Promise<boolean> {
  const partidosPendientes = await prisma.partido.count({
    where: {
      fase,
      estado: {
        not: 'FINALIZADO',
      },
    },
  })

  return partidosPendientes === 0
}

/**
 * Avanza ganadores de una ronda a la siguiente
 */
async function avanzarRonda(
  mapeo: Record<string, [string, string]>,
  nombreRonda: string,
  usarPerdedores: boolean = false
): Promise<number> {
  console.log(`\n🔄 Procesando ${nombreRonda}...`)
  let actualizados = 0

  for (const [rondaDestino, [ronda1, ronda2]] of Object.entries(mapeo)) {
    const equipo1 = usarPerdedores
      ? await obtenerPerdedor(ronda1)
      : await obtenerGanador(ronda1)
    const equipo2 = usarPerdedores
      ? await obtenerPerdedor(ronda2)
      : await obtenerGanador(ronda2)

    if (!equipo1 || !equipo2) {
      console.log(`  ⏳ ${rondaDestino}: Esperando resultados de ${ronda1} y/o ${ronda2}`)
      continue
    }

    // Obtener nombres para log
    const [equipoLocal, equipoVisitante] = await Promise.all([
      prisma.equipo.findUnique({ where: { id: equipo1 } }),
      prisma.equipo.findUnique({ where: { id: equipo2 } }),
    ])

    // Actualizar partido destino
    const updated = await prisma.partido.updateMany({
      where: { ronda: rondaDestino },
      data: {
        equipoLocalId: equipo1,
        equipoVisitanteId: equipo2,
      },
    })

    if (updated.count > 0) {
      console.log(
        `  ✅ ${rondaDestino}: ${equipoLocal?.bandera} ${equipoLocal?.nombre} vs ${equipoVisitante?.bandera} ${equipoVisitante?.nombre}`
      )
      actualizados++
    }
  }

  return actualizados
}

/**
 * Script principal para avanzar todas las eliminatorias
 */
async function avanzarEliminatorias() {
  console.log('🏆 Avanzando equipos en eliminatorias...\n')

  try {
    let totalActualizados = 0

    // 1. Dieciseisavos -> Octavos
    const dieciseisavosCompletos = await verificarFaseCompleta(Fase.DIECISEISAVOS)
    if (dieciseisavosCompletos) {
      console.log('✅ Dieciseisavos de final completados')
      totalActualizados += await avanzarRonda(DIECISEISAVOS_A_OCTAVOS, 'Dieciseisavos -> Octavos')
    } else {
      console.log('⏳ Dieciseisavos de final aún en progreso')
      // Intentar avanzar los partidos que ya terminaron
      totalActualizados += await avanzarRonda(DIECISEISAVOS_A_OCTAVOS, 'Dieciseisavos -> Octavos (parcial)')
    }

    // 2. Octavos -> Cuartos
    const octavosCompletos = await verificarFaseCompleta(Fase.OCTAVOS)
    if (octavosCompletos) {
      console.log('\n✅ Octavos de final completados')
      totalActualizados += await avanzarRonda(OCTAVOS_A_CUARTOS, 'Octavos -> Cuartos')
    } else {
      console.log('\n⏳ Octavos de final aún en progreso')
      totalActualizados += await avanzarRonda(OCTAVOS_A_CUARTOS, 'Octavos -> Cuartos (parcial)')
    }

    // 3. Cuartos -> Semifinales
    const cuartosCompletos = await verificarFaseCompleta(Fase.CUARTOS)
    if (cuartosCompletos) {
      console.log('\n✅ Cuartos de final completados')
      totalActualizados += await avanzarRonda(CUARTOS_A_SEMIFINALES, 'Cuartos -> Semifinales')
    } else {
      console.log('\n⏳ Cuartos de final aún en progreso')
      totalActualizados += await avanzarRonda(CUARTOS_A_SEMIFINALES, 'Cuartos -> Semifinales (parcial)')
    }

    // 4. Semifinales -> Final y Tercer Puesto
    const semifinalesCompletos = await verificarFaseCompleta(Fase.SEMIFINAL)
    if (semifinalesCompletos) {
      console.log('\n✅ Semifinales completadas')
      totalActualizados += await avanzarRonda(SEMIFINALES_A_FINAL, 'Semifinales -> Final')
      totalActualizados += await avanzarRonda(
        SEMIFINALES_A_TERCER_PUESTO,
        'Semifinales -> Tercer Puesto',
        true // usar perdedores
      )
    } else {
      console.log('\n⏳ Semifinales aún en progreso')
      totalActualizados += await avanzarRonda(SEMIFINALES_A_FINAL, 'Semifinales -> Final (parcial)')
      totalActualizados += await avanzarRonda(
        SEMIFINALES_A_TERCER_PUESTO,
        'Semifinales -> Tercer Puesto (parcial)',
        true
      )
    }

    console.log(`\n🎯 Total de partidos actualizados: ${totalActualizados}`)
    console.log('\n✨ Proceso completado!')
  } catch (error) {
    console.error('\n❌ Error al avanzar eliminatorias:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Función para ejecutar solo una fase específica
async function avanzarFase(fase: 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinales') {
  console.log(`🏆 Avanzando ganadores de ${fase}...\n`)

  try {
    let actualizados = 0

    switch (fase) {
      case 'dieciseisavos':
        actualizados = await avanzarRonda(DIECISEISAVOS_A_OCTAVOS, 'Dieciseisavos -> Octavos')
        break
      case 'octavos':
        actualizados = await avanzarRonda(OCTAVOS_A_CUARTOS, 'Octavos -> Cuartos')
        break
      case 'cuartos':
        actualizados = await avanzarRonda(CUARTOS_A_SEMIFINALES, 'Cuartos -> Semifinales')
        break
      case 'semifinales':
        actualizados += await avanzarRonda(SEMIFINALES_A_FINAL, 'Semifinales -> Final')
        actualizados += await avanzarRonda(
          SEMIFINALES_A_TERCER_PUESTO,
          'Semifinales -> Tercer Puesto',
          true
        )
        break
    }

    console.log(`\n🎯 Partidos actualizados: ${actualizados}`)
    console.log('\n✨ Proceso completado!')
  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2)
const fase = args[0] as 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinales' | undefined

if (fase && ['dieciseisavos', 'octavos', 'cuartos', 'semifinales'].includes(fase)) {
  // Ejecutar solo una fase
  avanzarFase(fase)
    .then(() => {
      console.log('\n👋 Script finalizado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
} else {
  // Ejecutar todas las fases
  avanzarEliminatorias()
    .then(() => {
      console.log('\n👋 Script finalizado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}
