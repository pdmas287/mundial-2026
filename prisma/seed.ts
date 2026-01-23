import { PrismaClient, Fase, TipoPremio } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...')
  await prisma.prediccionPremio.deleteMany()
  await prisma.prediccion.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.jugador.deleteMany()
  await prisma.premio.deleteMany()
  await prisma.partido.deleteMany()
  await prisma.equipo.deleteMany()
  await prisma.user.deleteMany()

  // 1. CREAR PREMIOS
  console.log('🏆 Creando premios...')
  await prisma.premio.createMany({
    data: [
      {
        tipo: TipoPremio.CAMPEON,
        nombre: 'Campeón del Mundial',
        descripcion: 'Equipo ganador del Mundial 2026',
        puntos: 25
      },
      {
        tipo: TipoPremio.SUBCAMPEON,
        nombre: 'Subcampeón',
        descripcion: 'Equipo finalista',
        puntos: 15
      },
      {
        tipo: TipoPremio.BALON_ORO,
        nombre: 'Balón de Oro',
        descripcion: 'Mejor jugador del torneo',
        puntos: 20
      },
      {
        tipo: TipoPremio.BOTA_ORO,
        nombre: 'Bota de Oro',
        descripcion: 'Máximo goleador del Mundial',
        puntos: 20
      },
      {
        tipo: TipoPremio.GUANTE_ORO,
        nombre: 'Guante de Oro',
        descripcion: 'Mejor portero del Mundial',
        puntos: 15
      }
    ]
  })

  // 2. CREAR EQUIPOS DEL MUNDIAL 2026 (48 equipos en 12 grupos de 4)
  // Datos oficiales del sorteo del 5 de diciembre de 2025
  console.log('⚽ Creando equipos...')

  // Función helper para generar URL de bandera usando flagcdn.com
  const flagUrl = (countryCode: string) => `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`

  // Equipos con ranking FIFA (posiciones aproximadas de enero 2025)
  // Menor número = mejor posición en el ranking
  const equipos = [
    // GRUPO A - México, Sudáfrica, Corea del Sur, Playoff UEFA D
    { nombre: 'México', codigo: 'MEX', bandera: flagUrl('mx'), grupo: 'A', rankingFIFA: 15 },
    { nombre: 'Sudáfrica', codigo: 'RSA', bandera: flagUrl('za'), grupo: 'A', rankingFIFA: 59 },
    { nombre: 'Corea del Sur', codigo: 'KOR', bandera: flagUrl('kr'), grupo: 'A', rankingFIFA: 22 },
    { nombre: 'Playoff UEFA D', codigo: 'PD1', bandera: flagUrl('eu'), grupo: 'A', rankingFIFA: 100 }, // Por definir

    // GRUPO B - Canadá, Playoff UEFA A, Qatar, Suiza
    { nombre: 'Canadá', codigo: 'CAN', bandera: flagUrl('ca'), grupo: 'B', rankingFIFA: 48 },
    { nombre: 'Playoff UEFA A', codigo: 'PA1', bandera: flagUrl('eu'), grupo: 'B', rankingFIFA: 100 }, // Por definir
    { nombre: 'Qatar', codigo: 'QAT', bandera: flagUrl('qa'), grupo: 'B', rankingFIFA: 35 },
    { nombre: 'Suiza', codigo: 'SUI', bandera: flagUrl('ch'), grupo: 'B', rankingFIFA: 19 },

    // GRUPO C - Brasil, Marruecos, Haití, Escocia
    { nombre: 'Brasil', codigo: 'BRA', bandera: flagUrl('br'), grupo: 'C', rankingFIFA: 5 },
    { nombre: 'Marruecos', codigo: 'MAR', bandera: flagUrl('ma'), grupo: 'C', rankingFIFA: 14 },
    { nombre: 'Haití', codigo: 'HAI', bandera: flagUrl('ht'), grupo: 'C', rankingFIFA: 81 },
    { nombre: 'Escocia', codigo: 'SCO', bandera: flagUrl('gb-sct'), grupo: 'C', rankingFIFA: 39 },

    // GRUPO D - Estados Unidos, Paraguay, Australia, Playoff UEFA C
    { nombre: 'Estados Unidos', codigo: 'USA', bandera: flagUrl('us'), grupo: 'D', rankingFIFA: 16 },
    { nombre: 'Paraguay', codigo: 'PAR', bandera: flagUrl('py'), grupo: 'D', rankingFIFA: 55 },
    { nombre: 'Australia', codigo: 'AUS', bandera: flagUrl('au'), grupo: 'D', rankingFIFA: 24 },
    { nombre: 'Playoff UEFA C', codigo: 'PC1', bandera: flagUrl('eu'), grupo: 'D', rankingFIFA: 100 }, // Por definir

    // GRUPO E - Alemania, Curazao, Costa de Marfil, Ecuador
    { nombre: 'Alemania', codigo: 'GER', bandera: flagUrl('de'), grupo: 'E', rankingFIFA: 11 },
    { nombre: 'Curazao', codigo: 'CUW', bandera: flagUrl('cw'), grupo: 'E', rankingFIFA: 85 },
    { nombre: 'Costa de Marfil', codigo: 'CIV', bandera: flagUrl('ci'), grupo: 'E', rankingFIFA: 38 },
    { nombre: 'Ecuador', codigo: 'ECU', bandera: flagUrl('ec'), grupo: 'E', rankingFIFA: 28 },

    // GRUPO F - Países Bajos, Japón, Playoff UEFA B, Túnez
    { nombre: 'Países Bajos', codigo: 'NED', bandera: flagUrl('nl'), grupo: 'F', rankingFIFA: 7 },
    { nombre: 'Japón', codigo: 'JPN', bandera: flagUrl('jp'), grupo: 'F', rankingFIFA: 18 },
    { nombre: 'Playoff UEFA B', codigo: 'PB1', bandera: flagUrl('eu'), grupo: 'F', rankingFIFA: 100 }, // Por definir
    { nombre: 'Túnez', codigo: 'TUN', bandera: flagUrl('tn'), grupo: 'F', rankingFIFA: 40 },

    // GRUPO G - Bélgica, Egipto, Irán, Nueva Zelanda
    { nombre: 'Bélgica', codigo: 'BEL', bandera: flagUrl('be'), grupo: 'G', rankingFIFA: 6 },
    { nombre: 'Egipto', codigo: 'EGY', bandera: flagUrl('eg'), grupo: 'G', rankingFIFA: 33 },
    { nombre: 'Irán', codigo: 'IRN', bandera: flagUrl('ir'), grupo: 'G', rankingFIFA: 20 },
    { nombre: 'Nueva Zelanda', codigo: 'NZL', bandera: flagUrl('nz'), grupo: 'G', rankingFIFA: 93 },

    // GRUPO H - España, Cabo Verde, Arabia Saudita, Uruguay
    { nombre: 'España', codigo: 'ESP', bandera: flagUrl('es'), grupo: 'H', rankingFIFA: 3 },
    { nombre: 'Cabo Verde', codigo: 'CPV', bandera: flagUrl('cv'), grupo: 'H', rankingFIFA: 75 },
    { nombre: 'Arabia Saudita', codigo: 'KSA', bandera: flagUrl('sa'), grupo: 'H', rankingFIFA: 56 },
    { nombre: 'Uruguay', codigo: 'URU', bandera: flagUrl('uy'), grupo: 'H', rankingFIFA: 9 },

    // GRUPO I - Francia, Senegal, Playoff Intercontinental 2, Noruega
    { nombre: 'Francia', codigo: 'FRA', bandera: flagUrl('fr'), grupo: 'I', rankingFIFA: 2 },
    { nombre: 'Senegal', codigo: 'SEN', bandera: flagUrl('sn'), grupo: 'I', rankingFIFA: 17 },
    { nombre: 'Playoff Intercon. 2', codigo: 'PI2', bandera: flagUrl('un'), grupo: 'I', rankingFIFA: 100 }, // Por definir
    { nombre: 'Noruega', codigo: 'NOR', bandera: flagUrl('no'), grupo: 'I', rankingFIFA: 46 },

    // GRUPO J - Argentina, Argelia, Austria, Jordania
    { nombre: 'Argentina', codigo: 'ARG', bandera: flagUrl('ar'), grupo: 'J', rankingFIFA: 1 },
    { nombre: 'Argelia', codigo: 'ALG', bandera: flagUrl('dz'), grupo: 'J', rankingFIFA: 37 },
    { nombre: 'Austria', codigo: 'AUT', bandera: flagUrl('at'), grupo: 'J', rankingFIFA: 23 },
    { nombre: 'Jordania', codigo: 'JOR', bandera: flagUrl('jo'), grupo: 'J', rankingFIFA: 70 },

    // GRUPO K - Portugal, Playoff Intercontinental 1, Uzbekistán, Colombia
    { nombre: 'Portugal', codigo: 'POR', bandera: flagUrl('pt'), grupo: 'K', rankingFIFA: 4 },
    { nombre: 'Playoff Intercon. 1', codigo: 'PI1', bandera: flagUrl('un'), grupo: 'K', rankingFIFA: 100 }, // Por definir
    { nombre: 'Uzbekistán', codigo: 'UZB', bandera: flagUrl('uz'), grupo: 'K', rankingFIFA: 62 },
    { nombre: 'Colombia', codigo: 'COL', bandera: flagUrl('co'), grupo: 'K', rankingFIFA: 12 },

    // GRUPO L - Inglaterra, Croacia, Ghana, Panamá
    { nombre: 'Inglaterra', codigo: 'ENG', bandera: flagUrl('gb-eng'), grupo: 'L', rankingFIFA: 8 },
    { nombre: 'Croacia', codigo: 'CRO', bandera: flagUrl('hr'), grupo: 'L', rankingFIFA: 13 },
    { nombre: 'Ghana', codigo: 'GHA', bandera: flagUrl('gh'), grupo: 'L', rankingFIFA: 60 },
    { nombre: 'Panamá', codigo: 'PAN', bandera: flagUrl('pa'), grupo: 'L', rankingFIFA: 42 },
  ]

  for (const equipo of equipos) {
    await prisma.equipo.create({ data: equipo })
  }

  // 3. CREAR PARTIDOS DE LA FASE DE GRUPOS
  // Calendario oficial del Mundial 2026
  console.log('📅 Creando partidos de fase de grupos...')

  const equiposCreados = await prisma.equipo.findMany()
  const getEquipo = (codigo: string) => equiposCreados.find(e => e.codigo === codigo)!

  // Partidos oficiales del Mundial 2026
  const partidos = [
    // Jornada 1 - 11 de Junio
    { fecha: '2026-06-11T12:00:00', local: 'MEX', visitante: 'RSA', sede: 'Ciudad de México', estadio: 'Estadio Azteca', grupo: 'A' },
    { fecha: '2026-06-11T18:00:00', local: 'KOR', visitante: 'PD1', sede: 'Guadalajara', estadio: 'Estadio Akron', grupo: 'A' }, // Playoff UEFA D

    // Jornada 1 - 12 de Junio
    { fecha: '2026-06-12T12:00:00', local: 'CAN', visitante: 'PA1', sede: 'Toronto', estadio: 'BMO Field', grupo: 'B' }, // Playoff UEFA A
    { fecha: '2026-06-12T18:00:00', local: 'USA', visitante: 'PAR', sede: 'Los Ángeles', estadio: 'SoFi Stadium', grupo: 'D' },

    // Jornada 1 - 13 de Junio
    { fecha: '2026-06-13T12:00:00', local: 'BRA', visitante: 'MAR', sede: 'Nueva York', estadio: 'MetLife Stadium', grupo: 'C' },
    { fecha: '2026-06-13T15:00:00', local: 'HAI', visitante: 'SCO', sede: 'Boston', estadio: 'Gillette Stadium', grupo: 'C' },
    { fecha: '2026-06-13T18:00:00', local: 'QAT', visitante: 'SUI', sede: 'San Francisco', estadio: "Levi's Stadium", grupo: 'B' },
    { fecha: '2026-06-13T21:00:00', local: 'AUS', visitante: 'PC1', sede: 'Vancouver', estadio: 'BC Place', grupo: 'D' }, // Playoff UEFA C

    // Jornada 1 - 14 de Junio
    { fecha: '2026-06-14T12:00:00', local: 'GER', visitante: 'CUW', sede: 'Houston', estadio: 'NRG Stadium', grupo: 'E' },
    { fecha: '2026-06-14T15:00:00', local: 'NED', visitante: 'JPN', sede: 'Dallas', estadio: 'AT&T Stadium', grupo: 'F' },
    { fecha: '2026-06-14T18:00:00', local: 'PB1', visitante: 'TUN', sede: 'Monterrey', estadio: 'Estadio BBVA', grupo: 'F' }, // Playoff UEFA B
    { fecha: '2026-06-14T21:00:00', local: 'CIV', visitante: 'ECU', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', grupo: 'E' },

    // Jornada 1 - 15 de Junio
    { fecha: '2026-06-15T12:00:00', local: 'ESP', visitante: 'CPV', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', grupo: 'H' },
    { fecha: '2026-06-15T15:00:00', local: 'BEL', visitante: 'EGY', sede: 'Seattle', estadio: 'Lumen Field', grupo: 'G' },
    { fecha: '2026-06-15T18:00:00', local: 'IRN', visitante: 'NZL', sede: 'Los Ángeles', estadio: 'SoFi Stadium', grupo: 'G' },
    { fecha: '2026-06-15T21:00:00', local: 'KSA', visitante: 'URU', sede: 'Miami', estadio: 'Hard Rock Stadium', grupo: 'H' },

    // Jornada 1 - 16 de Junio
    { fecha: '2026-06-16T12:00:00', local: 'FRA', visitante: 'SEN', sede: 'Nueva York', estadio: 'MetLife Stadium', grupo: 'I' },
    { fecha: '2026-06-16T15:00:00', local: 'ARG', visitante: 'ALG', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', grupo: 'J' },
    { fecha: '2026-06-16T18:00:00', local: 'AUT', visitante: 'JOR', sede: 'San Francisco', estadio: "Levi's Stadium", grupo: 'J' },
    { fecha: '2026-06-16T21:00:00', local: 'PI2', visitante: 'NOR', sede: 'Boston', estadio: 'Gillette Stadium', grupo: 'I' }, // Playoff Intercon. 2

    // Jornada 1 - 17 de Junio
    { fecha: '2026-06-17T12:00:00', local: 'POR', visitante: 'PI1', sede: 'Houston', estadio: 'NRG Stadium', grupo: 'K' }, // Playoff Intercon. 1
    { fecha: '2026-06-17T15:00:00', local: 'ENG', visitante: 'CRO', sede: 'Dallas', estadio: 'AT&T Stadium', grupo: 'L' },
    { fecha: '2026-06-17T18:00:00', local: 'GHA', visitante: 'PAN', sede: 'Toronto', estadio: 'BMO Field', grupo: 'L' },
    { fecha: '2026-06-17T21:00:00', local: 'UZB', visitante: 'COL', sede: 'Ciudad de México', estadio: 'Estadio Azteca', grupo: 'K' },

    // Jornada 2 - 18 de Junio
    { fecha: '2026-06-18T12:00:00', local: 'PD1', visitante: 'RSA', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', grupo: 'A' }, // Playoff UEFA D
    { fecha: '2026-06-18T15:00:00', local: 'MEX', visitante: 'KOR', sede: 'Guadalajara', estadio: 'Estadio Akron', grupo: 'A' },
    { fecha: '2026-06-18T18:00:00', local: 'SUI', visitante: 'PA1', sede: 'Los Ángeles', estadio: 'SoFi Stadium', grupo: 'B' }, // Playoff UEFA A
    { fecha: '2026-06-18T21:00:00', local: 'CAN', visitante: 'QAT', sede: 'Vancouver', estadio: 'BC Place', grupo: 'B' },

    // Jornada 2 - 19 de Junio
    { fecha: '2026-06-19T12:00:00', local: 'SCO', visitante: 'MAR', sede: 'Boston', estadio: 'Gillette Stadium', grupo: 'C' },
    { fecha: '2026-06-19T15:00:00', local: 'BRA', visitante: 'HAI', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', grupo: 'C' },
    { fecha: '2026-06-19T18:00:00', local: 'PC1', visitante: 'PAR', sede: 'San Francisco', estadio: "Levi's Stadium", grupo: 'D' }, // Playoff UEFA C
    { fecha: '2026-06-19T21:00:00', local: 'USA', visitante: 'AUS', sede: 'Seattle', estadio: 'Lumen Field', grupo: 'D' },

    // Jornada 2 - 20 de Junio
    { fecha: '2026-06-20T12:00:00', local: 'NED', visitante: 'PB1', sede: 'Houston', estadio: 'NRG Stadium', grupo: 'F' }, // Playoff UEFA B
    { fecha: '2026-06-20T15:00:00', local: 'TUN', visitante: 'JPN', sede: 'Monterrey', estadio: 'Estadio BBVA', grupo: 'F' }, // Partido 1000 del Mundial
    { fecha: '2026-06-20T18:00:00', local: 'ECU', visitante: 'CUW', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', grupo: 'E' },
    { fecha: '2026-06-20T21:00:00', local: 'GER', visitante: 'CIV', sede: 'Toronto', estadio: 'BMO Field', grupo: 'E' },

    // Jornada 2 - 21 de Junio
    { fecha: '2026-06-21T12:00:00', local: 'ESP', visitante: 'KSA', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', grupo: 'H' },
    { fecha: '2026-06-21T15:00:00', local: 'URU', visitante: 'CPV', sede: 'Miami', estadio: 'Hard Rock Stadium', grupo: 'H' },
    { fecha: '2026-06-21T18:00:00', local: 'BEL', visitante: 'IRN', sede: 'Los Ángeles', estadio: 'SoFi Stadium', grupo: 'G' },
    { fecha: '2026-06-21T21:00:00', local: 'NZL', visitante: 'EGY', sede: 'Vancouver', estadio: 'BC Place', grupo: 'G' },

    // Jornada 2 - 22 de Junio
    { fecha: '2026-06-22T12:00:00', local: 'FRA', visitante: 'PI2', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', grupo: 'I' }, // Playoff Intercon. 2
    { fecha: '2026-06-22T15:00:00', local: 'NOR', visitante: 'SEN', sede: 'Nueva York', estadio: 'MetLife Stadium', grupo: 'I' },
    { fecha: '2026-06-22T18:00:00', local: 'ARG', visitante: 'AUT', sede: 'Dallas', estadio: 'AT&T Stadium', grupo: 'J' },
    { fecha: '2026-06-22T21:00:00', local: 'JOR', visitante: 'ALG', sede: 'San Francisco', estadio: "Levi's Stadium", grupo: 'J' },

    // Jornada 2 - 23 de Junio
    { fecha: '2026-06-23T12:00:00', local: 'POR', visitante: 'UZB', sede: 'Houston', estadio: 'NRG Stadium', grupo: 'K' },
    { fecha: '2026-06-23T15:00:00', local: 'COL', visitante: 'PI1', sede: 'Guadalajara', estadio: 'Estadio Akron', grupo: 'K' }, // Playoff Intercon. 1
    { fecha: '2026-06-23T18:00:00', local: 'ENG', visitante: 'GHA', sede: 'Boston', estadio: 'Gillette Stadium', grupo: 'L' },
    { fecha: '2026-06-23T21:00:00', local: 'PAN', visitante: 'CRO', sede: 'Toronto', estadio: 'BMO Field', grupo: 'L' },

    // Jornada 3 - 24 de Junio
    { fecha: '2026-06-24T12:00:00', local: 'PD1', visitante: 'MEX', sede: 'Ciudad de México', estadio: 'Estadio Azteca', grupo: 'A' }, // Playoff UEFA D
    { fecha: '2026-06-24T12:00:00', local: 'RSA', visitante: 'KOR', sede: 'Monterrey', estadio: 'Estadio BBVA', grupo: 'A' },
    { fecha: '2026-06-24T18:00:00', local: 'PA1', visitante: 'QAT', sede: 'Seattle', estadio: 'Lumen Field', grupo: 'B' }, // Playoff UEFA A
    { fecha: '2026-06-24T18:00:00', local: 'SUI', visitante: 'CAN', sede: 'Vancouver', estadio: 'BC Place', grupo: 'B' },
    { fecha: '2026-06-24T21:00:00', local: 'MAR', visitante: 'HAI', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', grupo: 'C' },
    { fecha: '2026-06-24T21:00:00', local: 'SCO', visitante: 'BRA', sede: 'Miami', estadio: 'Hard Rock Stadium', grupo: 'C' },

    // Jornada 3 - 25 de Junio
    { fecha: '2026-06-25T12:00:00', local: 'PC1', visitante: 'USA', sede: 'Los Ángeles', estadio: 'SoFi Stadium', grupo: 'D' }, // Playoff UEFA C
    { fecha: '2026-06-25T12:00:00', local: 'PAR', visitante: 'AUS', sede: 'San Francisco', estadio: "Levi's Stadium", grupo: 'D' },
    { fecha: '2026-06-25T18:00:00', local: 'JPN', visitante: 'PB1', sede: 'Dallas', estadio: 'AT&T Stadium', grupo: 'F' }, // Playoff UEFA B
    { fecha: '2026-06-25T18:00:00', local: 'TUN', visitante: 'NED', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', grupo: 'F' },
    { fecha: '2026-06-25T21:00:00', local: 'ECU', visitante: 'GER', sede: 'Nueva York', estadio: 'MetLife Stadium', grupo: 'E' },
    { fecha: '2026-06-25T21:00:00', local: 'CUW', visitante: 'CIV', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', grupo: 'E' },

    // Jornada 3 - 26 de Junio
    { fecha: '2026-06-26T12:00:00', local: 'URU', visitante: 'ESP', sede: 'Guadalajara', estadio: 'Estadio Akron', grupo: 'H' },
    { fecha: '2026-06-26T12:00:00', local: 'CPV', visitante: 'KSA', sede: 'Houston', estadio: 'NRG Stadium', grupo: 'H' },
    { fecha: '2026-06-26T18:00:00', local: 'EGY', visitante: 'IRN', sede: 'Seattle', estadio: 'Lumen Field', grupo: 'G' },
    { fecha: '2026-06-26T18:00:00', local: 'NZL', visitante: 'BEL', sede: 'Vancouver', estadio: 'BC Place', grupo: 'G' },
    { fecha: '2026-06-26T21:00:00', local: 'NOR', visitante: 'FRA', sede: 'Boston', estadio: 'Gillette Stadium', grupo: 'I' },
    { fecha: '2026-06-26T21:00:00', local: 'SEN', visitante: 'PI2', sede: 'Toronto', estadio: 'BMO Field', grupo: 'I' }, // Playoff Intercon. 2

    // Jornada 3 - 27 de Junio
    { fecha: '2026-06-27T12:00:00', local: 'JOR', visitante: 'ARG', sede: 'Dallas', estadio: 'AT&T Stadium', grupo: 'J' },
    { fecha: '2026-06-27T12:00:00', local: 'ALG', visitante: 'AUT', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', grupo: 'J' },
    { fecha: '2026-06-27T18:00:00', local: 'COL', visitante: 'POR', sede: 'Miami', estadio: 'Hard Rock Stadium', grupo: 'K' },
    { fecha: '2026-06-27T18:00:00', local: 'PI1', visitante: 'UZB', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', grupo: 'K' }, // Playoff Intercon. 1
    { fecha: '2026-06-27T21:00:00', local: 'PAN', visitante: 'ENG', sede: 'Nueva York', estadio: 'MetLife Stadium', grupo: 'L' },
    { fecha: '2026-06-27T21:00:00', local: 'CRO', visitante: 'GHA', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', grupo: 'L' },
  ]

  for (const partido of partidos) {
    const equipoLocal = getEquipo(partido.local)
    const equipoVisitante = getEquipo(partido.visitante)

    await prisma.partido.create({
      data: {
        fase: Fase.GRUPOS,
        grupo: partido.grupo,
        fecha: new Date(partido.fecha),
        sede: partido.sede,
        estadio: partido.estadio,
        equipoLocalId: equipoLocal.id,
        equipoVisitanteId: equipoVisitante.id,
      }
    })
  }

  // 4. CREAR PARTIDOS DE ELIMINATORIAS
  console.log('🏆 Creando partidos de eliminatorias...')

  // Dieciseisavos de Final (16 partidos) - 28 junio al 2 julio 2026
  const dieciseisavos = [
    // 28 de Junio
    { fecha: '2026-06-28T12:00:00', sede: 'Los Ángeles', estadio: 'SoFi Stadium', ronda: 'M73' },
    { fecha: '2026-06-28T18:00:00', sede: 'Nueva York', estadio: 'MetLife Stadium', ronda: 'M74' },
    // 29 de Junio
    { fecha: '2026-06-29T12:00:00', sede: 'Dallas', estadio: 'AT&T Stadium', ronda: 'M75' },
    { fecha: '2026-06-29T18:00:00', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', ronda: 'M76' },
    // 30 de Junio
    { fecha: '2026-06-30T12:00:00', sede: 'Houston', estadio: 'NRG Stadium', ronda: 'M77' },
    { fecha: '2026-06-30T15:00:00', sede: 'Miami', estadio: 'Hard Rock Stadium', ronda: 'M78' },
    { fecha: '2026-06-30T18:00:00', sede: 'Ciudad de México', estadio: 'Estadio Azteca', ronda: 'M79' },
    { fecha: '2026-06-30T21:00:00', sede: 'Seattle', estadio: 'Lumen Field', ronda: 'M80' },
    // 1 de Julio
    { fecha: '2026-07-01T12:00:00', sede: 'San Francisco', estadio: "Levi's Stadium", ronda: 'M81' },
    { fecha: '2026-07-01T15:00:00', sede: 'Boston', estadio: 'Gillette Stadium', ronda: 'M82' },
    { fecha: '2026-07-01T18:00:00', sede: 'Filadelfia', estadio: 'Lincoln Financial Field', ronda: 'M83' },
    { fecha: '2026-07-01T21:00:00', sede: 'Guadalajara', estadio: 'Estadio Akron', ronda: 'M84' },
    // 2 de Julio
    { fecha: '2026-07-02T12:00:00', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', ronda: 'M85' },
    { fecha: '2026-07-02T15:00:00', sede: 'Toronto', estadio: 'BMO Field', ronda: 'M86' },
    { fecha: '2026-07-02T18:00:00', sede: 'Vancouver', estadio: 'BC Place', ronda: 'M87' },
    { fecha: '2026-07-02T21:00:00', sede: 'Monterrey', estadio: 'Estadio BBVA', ronda: 'M88' },
  ]

  for (const partido of dieciseisavos) {
    await prisma.partido.create({
      data: {
        fase: Fase.DIECISEISAVOS,
        ronda: partido.ronda as any,
        fecha: new Date(partido.fecha),
        sede: partido.sede,
        estadio: partido.estadio,
        // equipoLocalId y equipoVisitanteId son null - se definen después de grupos
      }
    })
  }

  // Octavos de Final (8 partidos) - 3-6 julio 2026
  const octavos = [
    { fecha: '2026-07-03T18:00:00', sede: 'Los Ángeles', estadio: 'SoFi Stadium', ronda: 'M89' },
    { fecha: '2026-07-03T21:00:00', sede: 'Nueva York', estadio: 'MetLife Stadium', ronda: 'M90' },
    { fecha: '2026-07-04T18:00:00', sede: 'Dallas', estadio: 'AT&T Stadium', ronda: 'M91' },
    { fecha: '2026-07-04T21:00:00', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', ronda: 'M92' },
    { fecha: '2026-07-05T18:00:00', sede: 'Houston', estadio: 'NRG Stadium', ronda: 'M93' },
    { fecha: '2026-07-05T21:00:00', sede: 'Miami', estadio: 'Hard Rock Stadium', ronda: 'M94' },
    { fecha: '2026-07-06T18:00:00', sede: 'Ciudad de México', estadio: 'Estadio Azteca', ronda: 'M95' },
    { fecha: '2026-07-06T21:00:00', sede: 'Boston', estadio: 'Gillette Stadium', ronda: 'M96' },
  ]

  for (const partido of octavos) {
    await prisma.partido.create({
      data: {
        fase: Fase.OCTAVOS,
        ronda: partido.ronda as any,
        fecha: new Date(partido.fecha),
        sede: partido.sede,
        estadio: partido.estadio,
      }
    })
  }

  // Cuartos de Final (4 partidos) - 9-12 julio 2026
  const cuartos = [
    { fecha: '2026-07-09T18:00:00', sede: 'Los Ángeles', estadio: 'SoFi Stadium', ronda: 'M97' },
    { fecha: '2026-07-10T18:00:00', sede: 'Nueva York', estadio: 'MetLife Stadium', ronda: 'M98' },
    { fecha: '2026-07-11T18:00:00', sede: 'Dallas', estadio: 'AT&T Stadium', ronda: 'M99' },
    { fecha: '2026-07-12T18:00:00', sede: 'Kansas City', estadio: 'GEHA Field at Arrowhead Stadium', ronda: 'M100' },
  ]

  for (const partido of cuartos) {
    await prisma.partido.create({
      data: {
        fase: Fase.CUARTOS,
        ronda: partido.ronda as any,
        fecha: new Date(partido.fecha),
        sede: partido.sede,
        estadio: partido.estadio,
      }
    })
  }

  // Semifinales (2 partidos) - 15-16 julio 2026
  const semifinales = [
    { fecha: '2026-07-15T18:00:00', sede: 'Atlanta', estadio: 'Mercedes-Benz Stadium', ronda: 'M101' },
    { fecha: '2026-07-16T18:00:00', sede: 'Nueva York', estadio: 'MetLife Stadium', ronda: 'M102' },
  ]

  for (const partido of semifinales) {
    await prisma.partido.create({
      data: {
        fase: Fase.SEMIFINAL,
        ronda: partido.ronda as any,
        fecha: new Date(partido.fecha),
        sede: partido.sede,
        estadio: partido.estadio,
      }
    })
  }

  // Tercer Puesto - 19 julio 2026
  await prisma.partido.create({
    data: {
      fase: Fase.TERCER_PUESTO,
      ronda: 'M103' as any,
      fecha: new Date('2026-07-19T15:00:00'),
      sede: 'Miami',
      estadio: 'Hard Rock Stadium',
    }
  })

  // Final - 19 julio 2026
  await prisma.partido.create({
    data: {
      fase: Fase.FINAL,
      ronda: 'M104' as any,
      fecha: new Date('2026-07-19T18:00:00'),
      sede: 'Nueva York',
      estadio: 'MetLife Stadium',
    }
  })

  // 5. CREAR JUGADORES DESTACADOS
  console.log('👤 Creando jugadores destacados...')

  const jugadoresDestacados = [
    // Delanteros
    { nombre: 'Kylian Mbappé', posicion: 'Delantero', equipo: 'FRA' },
    { nombre: 'Lionel Messi', posicion: 'Delantero', equipo: 'ARG' },
    { nombre: 'Erling Haaland', posicion: 'Delantero', equipo: 'NOR' },
    { nombre: 'Vinícius Jr.', posicion: 'Delantero', equipo: 'BRA' },
    { nombre: 'Harry Kane', posicion: 'Delantero', equipo: 'ENG' },
    { nombre: 'Lamine Yamal', posicion: 'Delantero', equipo: 'ESP' },
    { nombre: 'Rafael Leão', posicion: 'Delantero', equipo: 'POR' },
    { nombre: 'Florian Wirtz', posicion: 'Delantero', equipo: 'GER' },
    { nombre: 'Cody Gakpo', posicion: 'Delantero', equipo: 'NED' },
    { nombre: 'Darwin Núñez', posicion: 'Delantero', equipo: 'URU' },
    { nombre: 'Julián Álvarez', posicion: 'Delantero', equipo: 'ARG' },
    { nombre: 'Luis Díaz', posicion: 'Delantero', equipo: 'COL' },
    // Mediocampistas
    { nombre: 'Jude Bellingham', posicion: 'Mediocampista', equipo: 'ENG' },
    { nombre: 'Kevin De Bruyne', posicion: 'Mediocampista', equipo: 'BEL' },
    { nombre: 'Pedri', posicion: 'Mediocampista', equipo: 'ESP' },
    { nombre: 'Bruno Fernandes', posicion: 'Mediocampista', equipo: 'POR' },
    { nombre: 'Luka Modrić', posicion: 'Mediocampista', equipo: 'CRO' },
    { nombre: 'Rodri', posicion: 'Mediocampista', equipo: 'ESP' },
    { nombre: 'Enzo Fernández', posicion: 'Mediocampista', equipo: 'ARG' },
    { nombre: 'Jamal Musiala', posicion: 'Mediocampista', equipo: 'GER' },
    // Defensas
    { nombre: 'Virgil van Dijk', posicion: 'Defensa', equipo: 'NED' },
    { nombre: 'William Saliba', posicion: 'Defensa', equipo: 'FRA' },
    { nombre: 'Rúben Dias', posicion: 'Defensa', equipo: 'POR' },
    { nombre: 'Achraf Hakimi', posicion: 'Defensa', equipo: 'MAR' },
    // Porteros
    { nombre: 'Thibaut Courtois', posicion: 'Portero', equipo: 'BEL' },
    { nombre: 'Alisson Becker', posicion: 'Portero', equipo: 'BRA' },
    { nombre: 'Emiliano Martínez', posicion: 'Portero', equipo: 'ARG' },
    { nombre: 'Mike Maignan', posicion: 'Portero', equipo: 'FRA' },
  ]

  for (const jugador of jugadoresDestacados) {
    const equipo = getEquipo(jugador.equipo)
    await prisma.jugador.create({
      data: {
        nombre: jugador.nombre,
        posicion: jugador.posicion,
        equipoId: equipo.id,
      }
    })
  }

  // 5. CREAR USUARIO DE PRUEBA
  console.log('👥 Creando usuario de prueba...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'demo@mundial2026.com',
      nombre: 'Usuario Demo',
      password: hashedPassword,
      role: 'USER',
    }
  })

  // Crear usuario admin
  await prisma.user.create({
    data: {
      email: 'admin@mundial2026.com',
      nombre: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    }
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`
  📊 Resumen:
  - Premios: 5
  - Equipos: 48
  - Partidos de grupos: ${partidos.length}
  - Dieciseisavos de final: ${dieciseisavos.length}
  - Octavos de final: ${octavos.length}
  - Cuartos de final: ${cuartos.length}
  - Semifinales: ${semifinales.length}
  - Tercer puesto y Final: 2
  - Total partidos: ${partidos.length + dieciseisavos.length + octavos.length + cuartos.length + semifinales.length + 2}
  - Jugadores destacados: ${jugadoresDestacados.length}
  - Usuarios: 2

  🔑 Credenciales de prueba:
  Usuario: demo@mundial2026.com / password123
  Admin: admin@mundial2026.com / admin123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
