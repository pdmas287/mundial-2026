/**
 * Script para crear o actualizar el usuario administrador
 *
 * Uso:
 * npx tsx scripts/crear-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'pdmas287@gmail.com'
  const adminPassword = 'GraciasDios28.'
  const adminNombre = 'Administrador'

  console.log('🔧 Configurando usuario administrador...\n')

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingUser) {
    // Actualizar usuario existente a ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
      },
    })

    console.log('✅ Usuario actualizado a ADMIN:')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Nombre: ${updatedUser.nombre}`)
    console.log(`   Rol: ${updatedUser.role}`)
  } else {
    // Crear nuevo usuario administrador
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        nombre: adminNombre,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
      },
    })

    console.log('✅ Usuario administrador creado:')
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Nombre: ${newUser.nombre}`)
    console.log(`   Rol: ${newUser.role}`)
  }

  console.log('\n🎉 ¡Listo! Ya puedes iniciar sesión con las credenciales de admin.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
