/**
 * Script para eliminar un usuario y todos sus datos relacionados
 *
 * Uso:
 * npx tsx scripts/eliminar-usuario.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emailAEliminar = 'demo@mundial2026.com'

  console.log(`🔍 Buscando usuario ${emailAEliminar}...\n`)

  const usuario = await prisma.user.findUnique({
    where: { email: emailAEliminar },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      _count: {
        select: {
          predicciones: true,
          prediccionesPremios: true,
          notificaciones: true,
        },
      },
    },
  })

  if (!usuario) {
    console.log(`⚠️  No existe ningún usuario con el email ${emailAEliminar}. No hay nada que eliminar.`)
    return
  }

  console.log('👤 Usuario encontrado:')
  console.log(`   Email: ${usuario.email}`)
  console.log(`   Nombre: ${usuario.nombre}`)
  console.log(`   Rol: ${usuario.role}`)
  console.log(`   Predicciones: ${usuario._count.predicciones}`)
  console.log(`   Predicciones de premios: ${usuario._count.prediccionesPremios}`)
  console.log(`   Notificaciones: ${usuario._count.notificaciones}\n`)

  // Eliminar en una transacción: primero los registros relacionados
  // (no tienen borrado en cascada) y luego el usuario.
  await prisma.$transaction([
    prisma.prediccion.deleteMany({ where: { userId: usuario.id } }),
    prisma.prediccionPremio.deleteMany({ where: { userId: usuario.id } }),
    prisma.notificacion.deleteMany({ where: { userId: usuario.id } }),
    prisma.user.delete({ where: { id: usuario.id } }),
  ])

  console.log(`✅ Usuario ${emailAEliminar} y todos sus datos relacionados fueron eliminados.`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
