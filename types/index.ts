import { Fase, EstadoPartido, TipoPremio } from '@prisma/client'

export interface PartidoConEquipos {
  id: string
  fase: Fase
  grupo: string | null
  fecha: Date
  sede: string
  estadio: string
  equipoLocal: {
    id: string
    nombre: string
    codigo: string
    bandera: string
  }
  equipoVisitante: {
    id: string
    nombre: string
    codigo: string
    bandera: string
  }
  golesLocal: number | null
  golesVisitante: number | null
  estado: EstadoPartido
}

export interface PrediccionUsuario {
  id: string
  partidoId: string
  golesLocal: number
  golesVisitante: number
  puntosObtenidos: number | null
}

export interface RankingUsuario {
  posicion: number
  id: string
  nombre: string
  avatar: string | null
  puntosTotal: number
  aciertos: number
  prediccionesRealizadas: number
}

export interface PremioConPrediccion {
  id: string
  tipo: TipoPremio
  nombre: string
  descripcion: string
  puntos: number
  prediccionUsuario?: {
    jugadorId?: string
    equipoId?: string
  }
}
