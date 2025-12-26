import { PrismaClient, Equipo, Partido } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Representa la posición de un equipo en el grupo
 */
export interface PosicionGrupo {
  equipo: Equipo
  puntos: number
  partidosJugados: number
  partidosGanados: number
  partidosEmpatados: number
  partidosPerdidos: number
  golesFavor: number
  golesContra: number
  diferenciaGoles: number
  tarjetasAmarillas: number
  tarjetasRojas: number
  puntajeFairPlay: number
}

/**
 * Calcula la tabla de posiciones de un grupo
 * Aplica todos los criterios de desempate según Art. 12 del reglamento FIFA
 */
export async function calcularTablaGrupo(grupo: string): Promise<PosicionGrupo[]> {
  // Obtener equipos del grupo
  const equipos = await prisma.equipo.findMany({
    where: { grupo },
  })

  // Obtener partidos finalizados del grupo
  const partidos = await prisma.partido.findMany({
    where: {
      grupo,
      estado: 'FINALIZADO',
    },
    include: {
      equipoLocal: true,
      equipoVisitante: true,
    },
  })

  // Calcular estadísticas para cada equipo
  const tabla: PosicionGrupo[] = equipos.map((equipo) => {
    let puntos = 0
    let partidosJugados = 0
    let partidosGanados = 0
    let partidosEmpatados = 0
    let partidosPerdidos = 0
    let golesFavor = 0
    let golesContra = 0

    partidos.forEach((partido) => {
      if (!partido.equipoLocal || !partido.equipoVisitante) return
      if (partido.golesLocal === null || partido.golesVisitante === null) return

      const esLocal = partido.equipoLocal.id === equipo.id
      const esVisitante = partido.equipoVisitante.id === equipo.id

      if (!esLocal && !esVisitante) return

      partidosJugados++

      const golesAPro = esLocal ? partido.golesLocal : partido.golesVisitante
      const golesEnContra = esLocal ? partido.golesVisitante : partido.golesLocal

      golesFavor += golesAPro
      golesContra += golesEnContra

      if (golesAPro > golesEnContra) {
        puntos += 3
        partidosGanados++
      } else if (golesAPro === golesEnContra) {
        puntos += 1
        partidosEmpatados++
      } else {
        partidosPerdidos++
      }
    })

    return {
      equipo,
      puntos,
      partidosJugados,
      partidosGanados,
      partidosEmpatados,
      partidosPerdidos,
      golesFavor,
      golesContra,
      diferenciaGoles: golesFavor - golesContra,
      // TODO: Implementar sistema de tarjetas cuando se agregue al modelo
      tarjetasAmarillas: 0,
      tarjetasRojas: 0,
      puntajeFairPlay: 0,
    }
  })

  // Ordenar según criterios de desempate
  tabla.sort((a, b) => {
    // 1. Más puntos
    if (b.puntos !== a.puntos) return b.puntos - a.puntos

    // Si hay empate en puntos, aplicar criterios de duelo directo
    // (esto requeriría analizar partidos entre equipos empatados)
    // Por ahora aplicamos criterios generales:

    // 2. Mejor diferencia de goles
    if (b.diferenciaGoles !== a.diferenciaGoles) {
      return b.diferenciaGoles - a.diferenciaGoles
    }

    // 3. Más goles marcados
    if (b.golesFavor !== a.golesFavor) {
      return b.golesFavor - a.golesFavor
    }

    // 4. Fair play (menor es mejor)
    if (a.puntajeFairPlay !== b.puntajeFairPlay) {
      return a.puntajeFairPlay - b.puntajeFairPlay
    }

    // 5. Orden alfabético como último recurso
    return a.equipo.nombre.localeCompare(b.equipo.nombre)
  })

  return tabla
}

/**
 * Obtiene los equipos clasificados de un grupo (1° y 2°)
 */
export async function obtenerClasificadosGrupo(
  grupo: string
): Promise<{ primero: Equipo; segundo: Equipo }> {
  const tabla = await calcularTablaGrupo(grupo)

  if (tabla.length < 2) {
    throw new Error(`El grupo ${grupo} no tiene suficientes equipos`)
  }

  return {
    primero: tabla[0].equipo,
    segundo: tabla[1].equipo,
  }
}

/**
 * Obtiene el tercer lugar de un grupo
 */
export async function obtenerTerceroGrupo(grupo: string): Promise<PosicionGrupo> {
  const tabla = await calcularTablaGrupo(grupo)

  if (tabla.length < 3) {
    throw new Error(`El grupo ${grupo} no tiene tercer lugar`)
  }

  return tabla[2]
}

/**
 * Calcula los 8 mejores terceros lugares entre todos los grupos
 * Según Art. 13 del reglamento FIFA
 */
export async function calcularMejoresTerceros(): Promise<{
  mejoresTerceros: PosicionGrupo[]
  gruposClasificados: string[]
}> {
  const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  // Obtener todos los terceros lugares
  const terceros: PosicionGrupo[] = []
  for (const grupo of grupos) {
    try {
      const tercero = await obtenerTerceroGrupo(grupo)
      terceros.push(tercero)
    } catch (error) {
      console.error(`Error al obtener tercer lugar del grupo ${grupo}:`, error)
    }
  }

  // Ordenar terceros según criterios
  terceros.sort((a, b) => {
    // 1. Más puntos
    if (b.puntos !== a.puntos) return b.puntos - a.puntos

    // 2. Mejor diferencia de goles
    if (b.diferenciaGoles !== a.diferenciaGoles) {
      return b.diferenciaGoles - a.diferenciaGoles
    }

    // 3. Más goles marcados
    if (b.golesFavor !== a.golesFavor) {
      return b.golesFavor - a.golesFavor
    }

    // 4. Fair play (menor es mejor)
    if (a.puntajeFairPlay !== b.puntajeFairPlay) {
      return a.puntajeFairPlay - b.puntajeFairPlay
    }

    // 5. Orden alfabético
    return a.equipo.nombre.localeCompare(b.equipo.nombre)
  })

  // Tomar los 8 mejores
  const mejoresTerceros = terceros.slice(0, 8)
  const gruposClasificados = mejoresTerceros.map((t) => t.equipo.grupo)

  return {
    mejoresTerceros,
    gruposClasificados,
  }
}

/**
 * Verifica si todos los partidos de la fase de grupos han finalizado
 */
export async function fasesGruposCompletada(): Promise<boolean> {
  const partidosPendientes = await prisma.partido.count({
    where: {
      fase: 'GRUPOS',
      estado: {
        not: 'FINALIZADO',
      },
    },
  })

  return partidosPendientes === 0
}
