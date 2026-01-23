import { Fase } from '@prisma/client';

interface ResultadoReal {
  golesLocal: number;
  golesVisitante: number;
  penalesLocal?: number | null;
  penalesVisitante?: number | null;
}

interface Prediccion {
  golesLocal: number;
  golesVisitante: number;
  penalesLocal?: number | null;
  penalesVisitante?: number | null;
}

const MULTIPLICADORES: Record<Fase, number> = {
  GRUPOS: 1,
  DIECISEISAVOS: 1.25,  // Round of 32
  OCTAVOS: 1.5,         // Round of 16
  CUARTOS: 2,           // Quarter-finals
  SEMIFINAL: 2.5,       // Semi-finals
  TERCER_PUESTO: 2,     // Third place
  FINAL: 3,             // Final
};

export function calcularPuntos(
  prediccion: Prediccion,
  resultado: ResultadoReal,
  fase: Fase
): number {
  const multiplicador = MULTIPLICADORES[fase];
  let puntosTiempoRegular = 0;
  let puntosPenales = 0;

  // === PUNTOS POR TIEMPO REGULAR ===

  // Resultado exacto: 5 puntos
  if (
    prediccion.golesLocal === resultado.golesLocal &&
    prediccion.golesVisitante === resultado.golesVisitante
  ) {
    puntosTiempoRegular = 5;
  }
  // Acierto parcial: goles de un equipo - 2 puntos
  else if (
    prediccion.golesLocal === resultado.golesLocal ||
    prediccion.golesVisitante === resultado.golesVisitante
  ) {
    puntosTiempoRegular = 2;
  }
  // Acierto del ganador o empate - 1 punto
  else {
    const ganadorReal = determinarGanador(resultado);
    const ganadorPredicho = determinarGanador(prediccion);
    if (ganadorReal === ganadorPredicho) {
      puntosTiempoRegular = 1;
    }
  }

  // === PUNTOS POR PENALES (solo en eliminatorias con empate) ===
  const esEliminatoria = fase !== 'GRUPOS';
  const huboEmpateReal = resultado.golesLocal === resultado.golesVisitante;
  const huboPenalesReales = resultado.penalesLocal != null && resultado.penalesVisitante != null;
  const prediccionTienePenales = prediccion.penalesLocal != null && prediccion.penalesVisitante != null;

  if (esEliminatoria && huboEmpateReal && huboPenalesReales && prediccionTienePenales) {
    // Resultado exacto de penales: 5 puntos
    if (
      prediccion.penalesLocal === resultado.penalesLocal &&
      prediccion.penalesVisitante === resultado.penalesVisitante
    ) {
      puntosPenales = 5;
    }
    // Acierto parcial: penales de un equipo - 2 puntos
    else if (
      prediccion.penalesLocal === resultado.penalesLocal ||
      prediccion.penalesVisitante === resultado.penalesVisitante
    ) {
      puntosPenales = 2;
    }
    // Acierto del ganador de la tanda - 1 punto
    else {
      const ganadorPenalesReal = determinarGanadorPenales(resultado.penalesLocal!, resultado.penalesVisitante!);
      const ganadorPenalesPredicho = determinarGanadorPenales(prediccion.penalesLocal!, prediccion.penalesVisitante!);
      if (ganadorPenalesReal === ganadorPenalesPredicho) {
        puntosPenales = 1;
      }
    }
  }

  // Aplicar multiplicador a ambos y sumar
  return Math.round((puntosTiempoRegular + puntosPenales) * multiplicador);
}

type Ganador = 'LOCAL' | 'VISITANTE' | 'EMPATE';

function determinarGanador(resultado: { golesLocal: number; golesVisitante: number }): Ganador {
  if (resultado.golesLocal > resultado.golesVisitante) return 'LOCAL';
  if (resultado.golesLocal < resultado.golesVisitante) return 'VISITANTE';
  return 'EMPATE';
}

function determinarGanadorPenales(penalesLocal: number, penalesVisitante: number): 'LOCAL' | 'VISITANTE' {
  return penalesLocal > penalesVisitante ? 'LOCAL' : 'VISITANTE';
}
