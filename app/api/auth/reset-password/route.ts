import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { hashearToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

const schema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data
    const tokenHash = hashearToken(token)

    const registro = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    })

    if (!registro) {
      return NextResponse.json(
        { error: 'Este enlace no es válido o ya fue utilizado.' },
        { status: 400 }
      )
    }

    if (registro.expires < new Date()) {
      // Limpiar el token expirado
      await prisma.passwordResetToken.delete({ where: { id: registro.id } })
      return NextResponse.json(
        { error: 'Este enlace expiró. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Actualizar contraseña y consumir el token
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email: registro.email },
      data: { password: hashedPassword },
    })
    await prisma.passwordResetToken.delete({ where: { id: registro.id } })

    return NextResponse.json(
      { message: 'Contraseña actualizada correctamente.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en reset-password:', error)
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña.' },
      { status: 500 }
    )
  }
}
