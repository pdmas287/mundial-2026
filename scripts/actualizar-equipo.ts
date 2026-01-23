/**
 * Script para actualizar un equipo placeholder por el equipo real clasificado
 *
 * Uso:
 *   npx tsx scripts/actualizar-equipo.ts "Playoff UEFA A" "Ucrania" "UKR" "https://flagcdn.com/w80/ua.png"
 *
 * Parámetros:
 *   1. Nombre actual del equipo placeholder (ej: "Playoff UEFA A")
 *   2. Nuevo nombre del equipo (ej: "Ucrania")
 *   3. Nuevo código del equipo (ej: "UKR")
 *   4. URL de la bandera (ej: "https://flagcdn.com/w80/ua.png")
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function actualizarEquipo() {
  const args = process.argv.slice(2)

  if (args.length < 4) {
    console.log(`
Uso: npx tsx scripts/actualizar-equipo.ts <nombre_actual> <nuevo_nombre> <nuevo_codigo> <url_bandera>

Ejemplo:
  npx tsx scripts/actualizar-equipo.ts "Playoff UEFA A" "Ucrania" "UKR" "https://flagcdn.com/w80/ua.png"

Equipos placeholder actuales:
  - Playoff UEFA A (Grupo I)
  - Playoff UEFA B (Grupo I)
  - Playoff UEFA C (Grupo J)
  - Playoff UEFA D (Grupo J)
  - Playoff Intercon. 1 (Grupo L)
  - Playoff Intercon. 2 (Grupo L)
    `)
    process.exit(1)
  }

  const [nombreActual, nuevoNombre, nuevoCodigo, nuevaBandera] = args

  try {
    // Buscar el equipo actual
    const equipoExistente = await prisma.equipo.findUnique({
      where: { nombre: nombreActual },
    })

    if (!equipoExistente) {
      console.error(`Error: No se encontró el equipo "${nombreActual}"`)

      // Mostrar equipos disponibles
      const equipos = await prisma.equipo.findMany({
        where: {
          nombre: {
            contains: 'Playoff',
          },
        },
        select: { nombre: true, grupo: true },
      })

      console.log('\nEquipos placeholder disponibles:')
      equipos.forEach(e => console.log(`  - ${e.nombre} (Grupo ${e.grupo})`))

      process.exit(1)
    }

    // Verificar que el nuevo nombre no exista ya
    const nombreDuplicado = await prisma.equipo.findUnique({
      where: { nombre: nuevoNombre },
    })

    if (nombreDuplicado) {
      console.error(`Error: Ya existe un equipo con el nombre "${nuevoNombre}"`)
      process.exit(1)
    }

    // Verificar que el nuevo código no exista ya
    const codigoDuplicado = await prisma.equipo.findUnique({
      where: { codigo: nuevoCodigo },
    })

    if (codigoDuplicado) {
      console.error(`Error: Ya existe un equipo con el código "${nuevoCodigo}"`)
      process.exit(1)
    }

    // Actualizar el equipo
    const equipoActualizado = await prisma.equipo.update({
      where: { id: equipoExistente.id },
      data: {
        nombre: nuevoNombre,
        codigo: nuevoCodigo,
        bandera: nuevaBandera,
      },
    })

    console.log(`
✅ Equipo actualizado exitosamente!

  Antes:
    Nombre: ${nombreActual}
    Código: ${equipoExistente.codigo}
    Grupo:  ${equipoExistente.grupo}

  Después:
    Nombre: ${equipoActualizado.nombre}
    Código: ${equipoActualizado.codigo}
    Grupo:  ${equipoActualizado.grupo}
    Bandera: ${equipoActualizado.bandera}

El equipo mantiene su grupo y todos los partidos asociados.
    `)

  } catch (error) {
    console.error('Error al actualizar equipo:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

actualizarEquipo()
