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
  tarjetasDobleAmarilla: number
  puntajeFairPlay: number // Calculado: amarilla(-1) + dobleAmarilla(-3) + rojaDirecta(-4)
}

/**
 * Partido con equipos incluidos para cálculos
 */
type PartidoConEquipos = Partido & {
  equipoLocal: Equipo | null
  equipoVisitante: Equipo | null
}

/**
 * Calcula el puntaje de Fair Play según reglas FIFA
 * Amarilla: -1, Roja por doble amarilla: -3, Roja directa: -4
 */
function calcularPuntajeFairPlay(
  amarillas: number,
  dobleAmarillas: number,
  rojasDirectas: number
): number {
  return amarillas * -1 + dobleAmarillas * -3 + rojasDirectas * -4
}

/**
 * Calcula estadísticas de un equipo basado en una lista de partidos
 */
function calcularEstadisticasEquipo(
  equipo: Equipo,
  partidos: PartidoConEquipos[]
): Omit<PosicionGrupo, 'equipo'> {
  let puntos = 0
  let partidosJugados = 0
  let partidosGanados = 0
  let partidosEmpatados = 0
  let partidosPerdidos = 0
  let golesFavor = 0
  let golesContra = 0
  let tarjetasAmarillas = 0
  let tarjetasRojas = 0
  let tarjetasDobleAmarilla = 0

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

    // Acumular tarjetas
    if (esLocal) {
      tarjetasAmarillas += partido.tarjetasAmarillasLocal
      tarjetasRojas += partido.tarjetasRojasLocal
      tarjetasDobleAmarilla += partido.tarjetasDobleAmarillaLocal
    } else {
      tarjetasAmarillas += partido.tarjetasAmarillasVisitante
      tarjetasRojas += partido.tarjetasRojasVisitante
      tarjetasDobleAmarilla += partido.tarjetasDobleAmarillaVisitante
    }

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
    puntos,
    partidosJugados,
    partidosGanados,
    partidosEmpatados,
    partidosPerdidos,
    golesFavor,
    golesContra,
    diferenciaGoles: golesFavor - golesContra,
    tarjetasAmarillas,
    tarjetasRojas,
    tarjetasDobleAmarilla,
    puntajeFairPlay: calcularPuntajeFairPlay(
      tarjetasAmarillas,
      tarjetasDobleAmarilla,
      tarjetasRojas
    ),
  }
}

/**
 * Filtra partidos que involucran solo a los equipos especificados (duelo directo)
 */
function filtrarPartidosEntreEquipos(
  partidos: PartidoConEquipos[],
  equipoIds: string[]
): PartidoConEquipos[] {
  return partidos.filter((partido) => {
    if (!partido.equipoLocal || !partido.equipoVisitante) return false
    return (
      equipoIds.includes(partido.equipoLocal.id) &&
      equipoIds.includes(partido.equipoVisitante.id)
    )
  })
}

/**
 * Ordena equipos empatados usando criterios de duelo directo (head-to-head)
 * Retorna los equipos ordenados según los criterios FIFA
 */
function ordenarPorDueloDirecto(
  equiposEmpatados: PosicionGrupo[],
  todosLosPartidos: PartidoConEquipos[]
): PosicionGrupo[] {
  if (equiposEmpatados.length <= 1) return equiposEmpatados

  const equipoIds = equiposEmpatados.map((e) => e.equipo.id)
  const partidosDirectos = filtrarPartidosEntreEquipos(todosLosPartidos, equipoIds)

  // Si no hay partidos directos, no podemos usar este criterio
  if (partidosDirectos.length === 0) return equiposEmpatados

  // Calcular estadísticas solo de partidos directos
  const statsDirectos = equiposEmpatados.map((pos) => ({
    original: pos,
    directo: calcularEstadisticasEquipo(pos.equipo, partidosDirectos),
  }))

  // Ordenar por criterios de duelo directo
  statsDirectos.sort((a, b) => {
    // 1. Puntos en partidos directos
    if (b.directo.puntos !== a.directo.puntos) {
      return b.directo.puntos - a.directo.puntos
    }

    // 2. Diferencia de goles en partidos directos
    if (b.directo.diferenciaGoles !== a.directo.diferenciaGoles) {
      return b.directo.diferenciaGoles - a.directo.diferenciaGoles
    }

    // 3. Goles a favor en partidos directos
    if (b.directo.golesFavor !== a.directo.golesFavor) {
      return b.directo.golesFavor - a.directo.golesFavor
    }

    // Si aún hay empate en duelo directo, se pasa a criterios generales
    return 0
  })

  return statsDirectos.map((s) => s.original)
}

/**
 * Función principal de comparación según criterios FIFA completos
 * Retorna número negativo si a > b, positivo si b > a, 0 si iguales
 */
function compararEquiposFIFA(
  a: PosicionGrupo,
  b: PosicionGrupo,
  todosLosPartidos: PartidoConEquipos[]
): number {
  // 1. Más puntos (total del grupo)
  if (b.puntos !== a.puntos) return b.puntos - a.puntos

  // Los criterios 2-4 (duelo directo) se manejan en la función de ordenamiento principal
  // ya que requieren agrupar todos los equipos empatados primero

  // 5. Mejor diferencia de goles (total del grupo)
  if (b.diferenciaGoles !== a.diferenciaGoles) {
    return b.diferenciaGoles - a.diferenciaGoles
  }

  // 6. Más goles marcados (total del grupo)
  if (b.golesFavor !== a.golesFavor) {
    return b.golesFavor - a.golesFavor
  }

  // 7. Fair play (menor puntaje negativo = mejor)
  if (a.puntajeFairPlay !== b.puntajeFairPlay) {
    return b.puntajeFairPlay - a.puntajeFairPlay // b - a porque mayor (menos negativo) es mejor
  }

  // 8. Ranking FIFA (menor número = mejor posición)
  if (a.equipo.rankingFIFA !== b.equipo.rankingFIFA) {
    return a.equipo.rankingFIFA - b.equipo.rankingFIFA
  }

  // 9. Orden alfabético como último recurso
  return a.equipo.nombre.localeCompare(b.equipo.nombre)
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
  const tabla: PosicionGrupo[] = equipos.map((equipo) => ({
    equipo,
    ...calcularEstadisticasEquipo(equipo, partidos),
  }))

  // Ordenamiento con criterios FIFA completos incluyendo duelo directo
  return ordenarTablaConDueloDirecto(tabla, partidos)
}

/**
 * Ordena la tabla aplicando duelo directo cuando hay empates en puntos
 */
function ordenarTablaConDueloDirecto(
  tabla: PosicionGrupo[],
  partidos: PartidoConEquipos[]
): PosicionGrupo[] {
  // Primero ordenar por puntos para identificar grupos de empate
  tabla.sort((a, b) => b.puntos - a.puntos)

  // Identificar grupos de equipos con mismos puntos
  const resultado: PosicionGrupo[] = []
  let i = 0

  while (i < tabla.length) {
    const puntosActuales = tabla[i].puntos
    const equiposConMismosPuntos: PosicionGrupo[] = []

    // Agrupar todos los equipos con los mismos puntos
    while (i < tabla.length && tabla[i].puntos === puntosActuales) {
      equiposConMismosPuntos.push(tabla[i])
      i++
    }

    if (equiposConMismosPuntos.length === 1) {
      // Sin empate, agregar directamente
      resultado.push(equiposConMismosPuntos[0])
    } else {
      // Hay empate - aplicar duelo directo primero
      const ordenadosPorDueloDirecto = ordenarPorDueloDirecto(
        equiposConMismosPuntos,
        partidos
      )

      // Después del duelo directo, si aún hay empates, aplicar criterios generales
      // Agrupar por estadísticas de duelo directo
      let j = 0
      while (j < ordenadosPorDueloDirecto.length) {
        const equiposAunEmpatados: PosicionGrupo[] = [ordenadosPorDueloDirecto[j]]
        j++

        // Verificar si los siguientes siguen empatados después del duelo directo
        while (j < ordenadosPorDueloDirecto.length) {
          const prev = ordenadosPorDueloDirecto[j - 1]
          const curr = ordenadosPorDueloDirecto[j]

          // Verificar si están empatados en duelo directo
          const partidosDirectos = filtrarPartidosEntreEquipos(partidos, [
            prev.equipo.id,
            curr.equipo.id,
          ])
          const statsPrev = calcularEstadisticasEquipo(prev.equipo, partidosDirectos)
          const statsCurr = calcularEstadisticasEquipo(curr.equipo, partidosDirectos)

          if (
            statsPrev.puntos === statsCurr.puntos &&
            statsPrev.diferenciaGoles === statsCurr.diferenciaGoles &&
            statsPrev.golesFavor === statsCurr.golesFavor
          ) {
            equiposAunEmpatados.push(curr)
            j++
          } else {
            break
          }
        }

        // Ordenar por criterios generales (5-9)
        equiposAunEmpatados.sort((a, b) => compararEquiposFIFA(a, b, partidos))
        resultado.push(...equiposAunEmpatados)
      }
    }
  }

  return resultado
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

  // Ordenar terceros según criterios FIFA (sin duelo directo ya que son de grupos diferentes)
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

    // 4. Fair play (mayor = mejor, porque son negativos)
    if (a.puntajeFairPlay !== b.puntajeFairPlay) {
      return b.puntajeFairPlay - a.puntajeFairPlay
    }

    // 5. Ranking FIFA (menor = mejor)
    if (a.equipo.rankingFIFA !== b.equipo.rankingFIFA) {
      return a.equipo.rankingFIFA - b.equipo.rankingFIFA
    }

    // 6. Orden alfabético
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
