import { Fase } from '@prisma/client';

interface ResultadoReal {
  golesLocal: number;
  golesVisitante: number;
}

interface Prediccion {
  golesLocal: number;
  golesVisitante: number;
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

  // Resultado exacto: 5 puntos
  if (
    prediccion.golesLocal === resultado.golesLocal &&
    prediccion.golesVisitante === resultado.golesVisitante
  ) {
    return Math.round(5 * multiplicador);
  }

  // Acierto parcial: goles de un equipo
  const aciertoLocal = prediccion.golesLocal === resultado.golesLocal;
  const aciertoVisitante = prediccion.golesVisitante === resultado.golesVisitante;

  if (aciertoLocal || aciertoVisitante) {
    return Math.round(2 * multiplicador);
  }

  // Acierto del ganador o empate
  const ganadorReal = determinarGanador(resultado);
  const ganadorPredicho = determinarGanador(prediccion);

  if (ganadorReal === ganadorPredicho) {
    return Math.round(1 * multiplicador);
  }

  return 0;
}

type Ganador = 'LOCAL' | 'VISITANTE' | 'EMPATE';

function determinarGanador(resultado: { golesLocal: number; golesVisitante: number }): Ganador {
  if (resultado.golesLocal > resultado.golesVisitante) return 'LOCAL';
  if (resultado.golesLocal < resultado.golesVisitante) return 'VISITANTE';
  return 'EMPATE';
}
