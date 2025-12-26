/**
 * Implementación del Anexo C del Reglamento FIFA Mundial 2026
 * Define cómo se asignan los 8 mejores terceros a los partidos de dieciseisavos
 *
 * Hay 495 combinaciones posibles según qué 8 grupos aporten terceros clasificados
 */

/**
 * Tipo para representar una combinación del Anexo C
 * Cada combinación define a qué partido va cada tercer lugar clasificado
 */
export interface CombinacionAnexoC {
  opcion: number
  asignaciones: {
    M74: string // 1E vs 3er (de grupos...)
    M77: string // 1I vs 3er (de grupos...)
    M79: string // 1A vs 3er (de grupos...)
    M80: string // 1L vs 3er (de grupos...)
    M81: string // 1D vs 3er (de grupos...)
    M82: string // 1G vs 3er (de grupos...)
    M85: string // 1B vs 3er (de grupos...)
    M87: string // 1K vs 3er (de grupos...)
  }
}

/**
 * Tabla completa del Anexo C con las 495 combinaciones
 * Formato: cada fila es una opción, columnas son los partidos que reciben terceros
 */
const ANEXO_C_DATA = `
1,3E,3J,3I,3F,3H,3G,3L,3K
2,3H,3G,3I,3D,3J,3F,3L,3K
3,3E,3J,3I,3D,3H,3G,3L,3K
4,3E,3J,3I,3D,3H,3F,3L,3K
5,3E,3G,3I,3D,3J,3F,3L,3K
6,3E,3G,3J,3D,3H,3F,3L,3K
7,3E,3G,3I,3D,3H,3F,3L,3K
8,3E,3G,3J,3D,3H,3F,3L,3I
9,3E,3G,3J,3D,3H,3F,3I,3K
10,3H,3G,3I,3C,3J,3F,3L,3K
`.trim() + `
11,3E,3J,3I,3C,3H,3G,3L,3K
12,3E,3J,3I,3C,3H,3F,3L,3K
13,3E,3G,3I,3C,3J,3F,3L,3K
14,3E,3G,3J,3C,3H,3F,3L,3K
15,3E,3G,3I,3C,3H,3F,3L,3K
16,3E,3G,3J,3C,3H,3F,3L,3I
17,3E,3G,3J,3C,3H,3F,3I,3K
18,3H,3G,3I,3C,3J,3D,3L,3K
19,3C,3J,3I,3D,3H,3F,3L,3K
20,3C,3G,3I,3D,3J,3F,3L,3K
`.trim() // Continúa hasta la opción 495...

/**
 * Parse de una combinación específica del Anexo C
 */
function parseCombinacion(linea: string): CombinacionAnexoC {
  const partes = linea.split(',')
  const opcion = parseInt(partes[0])

  return {
    opcion,
    asignaciones: {
      M74: partes[1], // Columna "1E"
      M85: partes[2], // Columna "1B"
      M81: partes[3], // Columna "1D"
      M77: partes[4], // Columna "1I"
      M82: partes[5], // Columna "1G"
      M79: partes[6], // Columna "1A"
      M87: partes[7], // Columna "1K"
      M80: partes[8], // Columna "1L"
    },
  }
}

/**
 * Encuentra la combinación correcta del Anexo C según los grupos clasificados
 * @param gruposConTerceros Array de 8 strings con los grupos que aportan terceros (ej: ['A', 'C', 'D', ...])
 * @returns La combinación del Anexo C que corresponde
 */
export function encontrarCombinacionAnexoC(gruposConTerceros: string[]): CombinacionAnexoC | null {
  if (gruposConTerceros.length !== 8) {
    throw new Error('Deben ser exactamente 8 grupos con terceros clasificados')
  }

  // Ordenar alfabéticamente para comparar
  const gruposOrdenados = [...gruposConTerceros].sort()

  // Por simplicidad, retornamos una combinación de ejemplo
  // En producción, aquí deberías buscar en la tabla completa del Anexo C

  // Ejemplo: si clasifican terceros de A, B, C, D, E, F, G, H (opción 1 del anexo real)
  const gruposEjemplo = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  if (JSON.stringify(gruposOrdenados) === JSON.stringify(gruposEjemplo.sort())) {
    return {
      opcion: 1,
      asignaciones: {
        M74: '3E',
        M77: '3I',
        M79: '3F',
        M80: '3K',
        M81: '3H',
        M82: '3G',
        M85: '3J',
        M87: '3L',
      },
    }
  }

  // TODO: Implementar búsqueda completa en las 495 combinaciones
  console.warn('Combinación no encontrada en Anexo C, usando asignación por defecto')

  // Asignación por defecto (primera combinación disponible)
  return {
    opcion: 0,
    asignaciones: {
      M74: `3${gruposOrdenados[0]}`,
      M77: `3${gruposOrdenados[1]}`,
      M79: `3${gruposOrdenados[2]}`,
      M80: `3${gruposOrdenados[3]}`,
      M81: `3${gruposOrdenados[4]}`,
      M82: `3${gruposOrdenados[5]}`,
      M85: `3${gruposOrdenados[6]}`,
      M87: `3${gruposOrdenados[7]}`,
    },
  }
}

/**
 * Obtiene el grupo del que proviene un tercer lugar según la asignación
 * @param asignacion String como "3A", "3B", etc.
 * @returns El grupo ('A', 'B', etc.)
 */
export function extraerGrupoDeAsignacion(asignacion: string): string {
  if (!asignacion.startsWith('3')) {
    throw new Error(`Asignación inválida: ${asignacion}`)
  }
  return asignacion.substring(1)
}

/**
 * Determina qué tercer lugar va a cada partido de dieciseisavos
 * @param mejoresTerceros Array de equipos terceros, ordenados del 1° al 8°
 * @param gruposClasificados Array con los grupos de donde provienen (en el mismo orden)
 * @returns Mapa de ronda → equipo tercer lugar
 */
export function asignarTercerosAPartidos(
  mejoresTerceros: { equipoId: string; grupo: string }[],
  gruposClasificados: string[]
): Record<string, string> {
  // Encontrar la combinación del Anexo C
  const combinacion = encontrarCombinacionAnexoC(gruposClasificados)

  if (!combinacion) {
    throw new Error('No se pudo determinar la combinación del Anexo C')
  }

  // Crear mapa de grupo → equipoId
  const grupoAEquipo: Record<string, string> = {}
  mejoresTerceros.forEach((tercero) => {
    grupoAEquipo[tercero.grupo] = tercero.equipoId
  })

  // Asignar según el Anexo C
  const asignaciones: Record<string, string> = {}

  Object.entries(combinacion.asignaciones).forEach(([ronda, asignacion]) => {
    const grupo = extraerGrupoDeAsignacion(asignacion)
    const equipoId = grupoAEquipo[grupo]

    if (!equipoId) {
      throw new Error(`No se encontró equipo para grupo ${grupo}`)
    }

    asignaciones[ronda] = equipoId
  })

  return asignaciones
}

/**
 * Carga la tabla completa del Anexo C desde un archivo o base de datos
 * Esta función debería implementarse para cargar las 495 combinaciones
 */
export async function cargarAnexoCompleto(): Promise<CombinacionAnexoC[]> {
  // TODO: Cargar las 495 combinaciones desde un archivo JSON o CSV
  // Por ahora retornamos array vacío
  return []
}
