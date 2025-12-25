import { PrismaClient, Fase, Ronda, TipoPremio } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...')
  await prisma.prediccionPremio.deleteMany()
  await prisma.prediccion.deleteMany()
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
  console.log('⚽ Creando equipos...')

  const equipos = [
    // GRUPO A
    { nombre: 'México', codigo: 'MEX', bandera: '🇲🇽', grupo: 'A' },
    { nombre: 'Estados Unidos', codigo: 'USA', bandera: '🇺🇸', grupo: 'A' },
    { nombre: 'Canadá', codigo: 'CAN', bandera: '🇨🇦', grupo: 'A' },
    { nombre: 'Jamaica', codigo: 'JAM', bandera: '🇯🇲', grupo: 'A' },

    // GRUPO B
    { nombre: 'Argentina', codigo: 'ARG', bandera: '🇦🇷', grupo: 'B' },
    { nombre: 'Uruguay', codigo: 'URU', bandera: '🇺🇾', grupo: 'B' },
    { nombre: 'Chile', codigo: 'CHI', bandera: '🇨🇱', grupo: 'B' },
    { nombre: 'Paraguay', codigo: 'PAR', bandera: '🇵🇾', grupo: 'B' },

    // GRUPO C
    { nombre: 'Brasil', codigo: 'BRA', bandera: '🇧🇷', grupo: 'C' },
    { nombre: 'Colombia', codigo: 'COL', bandera: '🇨🇴', grupo: 'C' },
    { nombre: 'Ecuador', codigo: 'ECU', bandera: '🇪🇨', grupo: 'C' },
    { nombre: 'Perú', codigo: 'PER', bandera: '🇵🇪', grupo: 'C' },

    // GRUPO D
    { nombre: 'España', codigo: 'ESP', bandera: '🇪🇸', grupo: 'D' },
    { nombre: 'Portugal', codigo: 'POR', bandera: '🇵🇹', grupo: 'D' },
    { nombre: 'Italia', codigo: 'ITA', bandera: '🇮🇹', grupo: 'D' },
    { nombre: 'Países Bajos', codigo: 'NED', bandera: '🇳🇱', grupo: 'D' },

    // GRUPO E
    { nombre: 'Francia', codigo: 'FRA', bandera: '🇫🇷', grupo: 'E' },
    { nombre: 'Inglaterra', codigo: 'ENG', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', grupo: 'E' },
    { nombre: 'Alemania', codigo: 'GER', bandera: '🇩🇪', grupo: 'E' },
    { nombre: 'Bélgica', codigo: 'BEL', bandera: '🇧🇪', grupo: 'E' },

    // GRUPO F
    { nombre: 'Croacia', codigo: 'CRO', bandera: '🇭🇷', grupo: 'F' },
    { nombre: 'Suiza', codigo: 'SUI', bandera: '🇨🇭', grupo: 'F' },
    { nombre: 'Dinamarca', codigo: 'DEN', bandera: '🇩🇰', grupo: 'F' },
    { nombre: 'Austria', codigo: 'AUT', bandera: '🇦🇹', grupo: 'F' },

    // GRUPO G
    { nombre: 'Marruecos', codigo: 'MAR', bandera: '🇲🇦', grupo: 'G' },
    { nombre: 'Senegal', codigo: 'SEN', bandera: '🇸🇳', grupo: 'G' },
    { nombre: 'Nigeria', codigo: 'NGA', bandera: '🇳🇬', grupo: 'G' },
    { nombre: 'Egipto', codigo: 'EGY', bandera: '🇪🇬', grupo: 'G' },

    // GRUPO H
    { nombre: 'Japón', codigo: 'JPN', bandera: '🇯🇵', grupo: 'H' },
    { nombre: 'Corea del Sur', codigo: 'KOR', bandera: '🇰🇷', grupo: 'H' },
    { nombre: 'Australia', codigo: 'AUS', bandera: '🇦🇺', grupo: 'H' },
    { nombre: 'Arabia Saudita', codigo: 'KSA', bandera: '🇸🇦', grupo: 'H' },

    // GRUPO I
    { nombre: 'Polonia', codigo: 'POL', bandera: '🇵🇱', grupo: 'I' },
    { nombre: 'Ucrania', codigo: 'UKR', bandera: '🇺🇦', grupo: 'I' },
    { nombre: 'Serbia', codigo: 'SRB', bandera: '🇷🇸', grupo: 'I' },
    { nombre: 'Suecia', codigo: 'SWE', bandera: '🇸🇪', grupo: 'I' },

    // GRUPO J
    { nombre: 'Corea del Norte', codigo: 'PRK', bandera: '🇰🇵', grupo: 'J' },
    { nombre: 'Irán', codigo: 'IRN', bandera: '🇮🇷', grupo: 'J' },
    { nombre: 'Qatar', codigo: 'QAT', bandera: '🇶🇦', grupo: 'J' },
    { nombre: 'Irak', codigo: 'IRQ', bandera: '🇮🇶', grupo: 'J' },

    // GRUPO K
    { nombre: 'Camerún', codigo: 'CMR', bandera: '🇨🇲', grupo: 'K' },
    { nombre: 'Ghana', codigo: 'GHA', bandera: '🇬🇭', grupo: 'K' },
    { nombre: 'Costa de Marfil', codigo: 'CIV', bandera: '🇨🇮', grupo: 'K' },
    { nombre: 'Túnez', codigo: 'TUN', bandera: '🇹🇳', grupo: 'K' },

    // GRUPO L
    { nombre: 'Costa Rica', codigo: 'CRC', bandera: '🇨🇷', grupo: 'L' },
    { nombre: 'Panamá', codigo: 'PAN', bandera: '🇵🇦', grupo: 'L' },
    { nombre: 'Honduras', codigo: 'HON', bandera: '🇭🇳', grupo: 'L' },
    { nombre: 'El Salvador', codigo: 'SLV', bandera: '🇸🇻', grupo: 'L' },
  ]

  for (const equipo of equipos) {
    await prisma.equipo.create({ data: equipo })
  }

  // 3. CREAR PARTIDOS DE LA FASE DE GRUPOS
  console.log('📅 Creando partidos de fase de grupos...')

  const equiposCreados = await prisma.equipo.findMany()
  const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const sedes = [
    'Ciudad de México',
    'Guadalajara',
    'Monterrey',
    'Los Angeles',
    'Nueva York',
    'Dallas',
    'Atlanta',
    'Miami',
    'Seattle',
    'Kansas City',
    'Toronto',
    'Vancouver'
  ]

  let fechaInicio = new Date('2026-06-11T17:00:00')
  let partidoIndex = 0

  // Crear partidos de grupos
  for (const grupo of grupos) {
    const equiposGrupo = equiposCreados.filter(e => e.grupo === grupo)

    // Generar todos los enfrentamientos del grupo (6 partidos por grupo)
    const partidos = [
      [0, 1], [2, 3], // Jornada 1
      [0, 2], [1, 3], // Jornada 2
      [0, 3], [1, 2]  // Jornada 3
    ]

    for (const [idx1, idx2] of partidos) {
      const fecha = new Date(fechaInicio)
      fecha.setDate(fecha.getDate() + Math.floor(partidoIndex / 4))
      fecha.setHours(17 + (partidoIndex % 3) * 3)

      await prisma.partido.create({
        data: {
          fase: Fase.GRUPOS,
          grupo: grupo,
          fecha: fecha,
          sede: sedes[partidoIndex % sedes.length],
          estadio: `Estadio ${sedes[partidoIndex % sedes.length]}`,
          equipoLocalId: equiposGrupo[idx1].id,
          equipoVisitanteId: equiposGrupo[idx2].id,
        }
      })
      partidoIndex++
    }
  }

  // 4. CREAR JUGADORES DESTACADOS
  console.log('👤 Creando jugadores destacados...')

  const jugadores = [
    // Argentina
    { nombre: 'Lionel Messi', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'ARG')!.id },
    { nombre: 'Julián Álvarez', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'ARG')!.id },
    { nombre: 'Emiliano Martínez', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'ARG')!.id },

    // Brasil
    { nombre: 'Vinícius Júnior', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'BRA')!.id },
    { nombre: 'Neymar Jr', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'BRA')!.id },
    { nombre: 'Alisson Becker', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'BRA')!.id },

    // Francia
    { nombre: 'Kylian Mbappé', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'FRA')!.id },
    { nombre: 'Antoine Griezmann', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'FRA')!.id },
    { nombre: 'Mike Maignan', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'FRA')!.id },

    // Inglaterra
    { nombre: 'Harry Kane', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'ENG')!.id },
    { nombre: 'Jude Bellingham', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'ENG')!.id },
    { nombre: 'Jordan Pickford', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'ENG')!.id },

    // España
    { nombre: 'Pedri González', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'ESP')!.id },
    { nombre: 'Gavi', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'ESP')!.id },
    { nombre: 'Unai Simón', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'ESP')!.id },

    // Portugal
    { nombre: 'Cristiano Ronaldo', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'POR')!.id },
    { nombre: 'Bruno Fernandes', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'POR')!.id },
    { nombre: 'Diogo Costa', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'POR')!.id },

    // Alemania
    { nombre: 'Jamal Musiala', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'GER')!.id },
    { nombre: 'Kai Havertz', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'GER')!.id },
    { nombre: 'Marc-André ter Stegen', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'GER')!.id },

    // México
    { nombre: 'Hirving Lozano', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'MEX')!.id },
    { nombre: 'Raúl Jiménez', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'MEX')!.id },
    { nombre: 'Guillermo Ochoa', posicion: 'Portero', equipoId: equiposCreados.find(e => e.codigo === 'MEX')!.id },

    // Colombia
    { nombre: 'Luis Díaz', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'COL')!.id },
    { nombre: 'James Rodríguez', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'COL')!.id },

    // Uruguay
    { nombre: 'Darwin Núñez', posicion: 'Delantero', equipoId: equiposCreados.find(e => e.codigo === 'URU')!.id },
    { nombre: 'Federico Valverde', posicion: 'Mediocampista', equipoId: equiposCreados.find(e => e.codigo === 'URU')!.id },
  ]

  for (const jugador of jugadores) {
    await prisma.jugador.create({ data: jugador })
  }

  // 5. CREAR USUARIO DE PRUEBA
  console.log('👥 Creando usuario de prueba...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      email: 'demo@mundial2026.com',
      nombre: 'Usuario Demo',
      password: hashedPassword,
      avatar: '⭐',
      puntosTotal: 0
    }
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`
  📊 Resumen:
  - Premios: 5
  - Equipos: ${equipos.length}
  - Partidos de grupos: 72 (12 grupos × 6 partidos)
  - Jugadores destacados: ${jugadores.length}
  - Usuarios: 1

  🔑 Credenciales de prueba:
  Email: demo@mundial2026.com
  Password: password123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
