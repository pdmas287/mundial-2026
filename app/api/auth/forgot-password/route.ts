import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generarTokenRecuperacion, hashearToken, expiracionUnaHora } from '@/lib/tokens'
import { enviarEmailRecuperacion } from '@/lib/mail'

export const dynamic = 'force-dynamic'

const schema = z.object({ email: z.string().email().transform((e) => e.trim()) })

// Respuesta genérica: nunca revela si el email existe
const RESPUESTA_GENERICA = {
  message: 'Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    // Email mal formado: igual respondemos genérico
    if (!parsed.success) {
      return NextResponse.json(RESPUESTA_GENERICA, { status: 200 })
    }

    const { email } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Borrar tokens previos del mismo email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const tokenPlano = generarTokenRecuperacion()
      const tokenHash = hashearToken(tokenPlano)

      await prisma.passwordResetToken.create({
        data: { email, token: tokenHash, expires: expiracionUnaHora() },
      })

      const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const enlace = `${base}/restablecer-password?token=${tokenPlano}`

      try {
        await enviarEmailRecuperacion(email, enlace)
      } catch (err) {
        // No exponer fallo SMTP al usuario; loguear para diagnóstico
        console.error('Error al enviar email de recuperación:', err)
      }
    }

    return NextResponse.json(RESPUESTA_GENERICA, { status: 200 })
  } catch (error) {
    console.error('Error en forgot-password:', error)
    // Incluso ante error inesperado, respondemos genérico
    return NextResponse.json(RESPUESTA_GENERICA, { status: 200 })
  }
}
