import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos
    const validatedData = registerSchema.parse(body)
    const { email, nombre, password } = validatedData

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        nombre,
        password: hashedPassword,
        puntosTotal: 0,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}
