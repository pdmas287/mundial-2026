# Restablecer Contraseña — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que un usuario que olvidó su contraseña la restablezca mediante un enlace seguro enviado por email (SMTP Hostinger).

**Architecture:** Token aleatorio de un solo uso, guardado hasheado (SHA-256) en una tabla nueva `PasswordResetToken` con expiración de 1 hora. Dos endpoints (solicitar / restablecer) y dos páginas públicas en el route group `(auth)`. Email vía Nodemailer; en desarrollo el enlace se imprime en consola.

**Tech Stack:** Next.js 14 (App Router), Prisma 5 + PostgreSQL, NextAuth, bcryptjs, Zod, Nodemailer, Tailwind.

**Verificación:** No hay framework de tests unitarios en el proyecto. Cada tarea se verifica con `npm run build` (typecheck + compilación) y al final con Playwright E2E. No inventamos un runner de tests nuevo.

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `prisma/schema.prisma` | Modelo `PasswordResetToken` | Modificar |
| `lib/tokens.ts` | Generar/hashear token, calcular expiración | Crear |
| `lib/mail.ts` | Nodemailer + `enviarEmailRecuperacion` | Crear |
| `app/api/auth/forgot-password/route.ts` | Endpoint solicitar enlace | Crear |
| `app/api/auth/reset-password/route.ts` | Endpoint restablecer | Crear |
| `app/(auth)/recuperar-password/page.tsx` | Form pedir email | Crear |
| `app/(auth)/restablecer-password/page.tsx` | Form nueva contraseña | Crear |
| `app/(auth)/login/page.tsx` | Añadir enlace "¿Olvidaste...?" | Modificar |
| `.env.example` | Documentar variables SMTP | Crear/Modificar |

---

### Task 1: Dependencias y variables de entorno

**Files:**
- Modify: `package.json` (vía npm)
- Create/Modify: `.env.example`

- [ ] **Step 1: Instalar nodemailer**

Run:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```
Expected: se añaden a `package.json` sin errores.

- [ ] **Step 2: Documentar variables en `.env.example`**

Crear o añadir al final de `.env.example`:
```
# SMTP Hostinger (para emails de recuperación de contraseña)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@tudominio.com
SMTP_PASS=tu_password_smtp
SMTP_FROM="Mundial 2026 <info@tudominio.com>"

# URL base de la app (para construir el enlace de recuperación)
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: agregar nodemailer y variables SMTP para recuperacion"
```

---

### Task 2: Modelo PasswordResetToken en Prisma

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Añadir el modelo**

Añadir al final de `prisma/schema.prisma`:
```prisma
// ============ RECUPERACION DE CONTRASEÑA ============
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique // hash SHA-256 del token (no el token en claro)
  expires   DateTime // createdAt + 1 hora
  createdAt DateTime @default(now())

  @@index([email])
}
```

- [ ] **Step 2: Crear la migración**

Run:
```bash
npx prisma migrate dev --name add_password_reset_token
```
Expected: crea la migración y aplica en la BD local; regenera Prisma Client. Si no hay BD local, usar `npx prisma generate` y aplicar la migración en el VPS con `migrate deploy` (documentado en Task 9).

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores (el cliente Prisma reconoce `prisma.passwordResetToken`).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: agregar modelo PasswordResetToken"
```

---

### Task 3: Utilidad de tokens (`lib/tokens.ts`)

**Files:**
- Create: `lib/tokens.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import crypto from 'crypto'

// Token en claro que viaja en el email (URL-safe)
export function generarTokenRecuperacion(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash que se guarda en la base de datos (nunca el token en claro)
export function hashearToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Expiración: 1 hora desde ahora
export function expiracionUnaHora(): Date {
  return new Date(Date.now() + 60 * 60 * 1000)
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add lib/tokens.ts
git commit -m "feat: agregar utilidades de token de recuperacion"
```

---

### Task 4: Utilidad de email (`lib/mail.ts`)

**Files:**
- Create: `lib/mail.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function enviarEmailRecuperacion(email: string, enlace: string) {
  // En desarrollo o sin credenciales: imprimir el enlace en consola y no enviar.
  const sinCredenciales = !process.env.SMTP_HOST || !process.env.SMTP_USER
  if (process.env.NODE_ENV !== 'production' || sinCredenciales) {
    console.log('========================================')
    console.log('ENLACE DE RECUPERACION (modo desarrollo):')
    console.log(enlace)
    console.log('========================================')
    if (sinCredenciales) return
  }

  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Recupera tu contraseña - Mundial 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #302b63;">⚽ Mundial 2026</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en 1 hora.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${enlace}" style="background: #302b63; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #888; font-size: 13px;">Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.</p>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add lib/mail.ts
git commit -m "feat: agregar utilidad de envio de email de recuperacion"
```

---

### Task 5: Endpoint solicitar enlace (`forgot-password`)

**Files:**
- Create: `app/api/auth/forgot-password/route.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generarTokenRecuperacion, hashearToken, expiracionUnaHora } from '@/lib/tokens'
import { enviarEmailRecuperacion } from '@/lib/mail'

export const dynamic = 'force-dynamic'

const schema = z.object({ email: z.string().email() })

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
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila sin errores; aparece la ruta `/api/auth/forgot-password`.

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/forgot-password/route.ts
git commit -m "feat: endpoint forgot-password con respuesta generica"
```

---

### Task 6: Endpoint restablecer (`reset-password`)

**Files:**
- Create: `app/api/auth/reset-password/route.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
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
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece la ruta `/api/auth/reset-password`.

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/reset-password/route.ts
git commit -m "feat: endpoint reset-password con validacion de token"
```

---

### Task 7: Página solicitar recuperación (`/recuperar-password`)

**Files:**
- Create: `app/(auth)/recuperar-password/page.tsx`

Sigue el patrón EXACTO de `app/(auth)/login/page.tsx` (componentes `Card`, `Input`, `Button`, mismo fondo y estilos).

- [ ] **Step 1: Crear el archivo**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      console.error('Error al solicitar recuperación:', error)
    } finally {
      // Siempre mostramos el mensaje genérico, exista o no el email
      setEnviado(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">⚽</span>
          <h1 className="font-orbitron text-3xl font-black gradient-text mb-2">
            MUNDIAL 2026
          </h1>
          <p className="text-white/70">Recupera tu contraseña</p>
        </div>

        {enviado ? (
          <div className="text-center space-y-4">
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-300 text-sm">
              Si el email está registrado, te enviamos un enlace para restablecer
              tu contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).
            </div>
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">
                Volver a iniciar sesión
              </Link>
            </div>
          </>
        )}
      </Card>
    </main>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece la ruta `/recuperar-password`.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/recuperar-password/page.tsx"
git commit -m "feat: pagina recuperar-password"
```

---

### Task 8: Página restablecer (`/restablecer-password`)

**Files:**
- Create: `app/(auth)/restablecer-password/page.tsx`

Usa `useSearchParams` para leer `?token=`. Debe envolverse en `<Suspense>` (requisito de Next 14 para `useSearchParams` en páginas).

- [ ] **Step 1: Crear el archivo**

```tsx
'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

function RestablecerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Este enlace no es válido o ya fue utilizado.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al restablecer la contraseña')
        setLoading(false)
        return
      }

      setExito(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (error) {
      console.error('Error al restablecer:', error)
      setError('Error al restablecer la contraseña')
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-300 text-sm">
          ¡Contraseña actualizada! Redirigiendo al inicio de sesión...
        </div>
        <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
            Nueva contraseña
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
          <p className="text-xs text-white/50 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
            Confirmar contraseña
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm">
          Volver a iniciar sesión
        </Link>
      </div>
    </>
  )
}

export default function RestablecerPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">⚽</span>
          <h1 className="font-orbitron text-3xl font-black gradient-text mb-2">
            MUNDIAL 2026
          </h1>
          <p className="text-white/70">Crea tu nueva contraseña</p>
        </div>
        <Suspense fallback={<p className="text-white/70 text-center">Cargando...</p>}>
          <RestablecerForm />
        </Suspense>
      </Card>
    </main>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece la ruta `/restablecer-password`.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/restablecer-password/page.tsx"
git commit -m "feat: pagina restablecer-password"
```

---

### Task 9: Enlace en la página de login

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Añadir el enlace "¿Olvidaste tu contraseña?"**

En `app/(auth)/login/page.tsx`, justo después del `</form>` (cierre del formulario, antes del `<div className="mt-6 text-center">` que tiene "¿No tienes cuenta?"), insertar:

```tsx
        <div className="mt-4 text-center">
          <Link href="/recuperar-password" className="text-white/60 hover:text-white text-sm">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
```

(El import de `Link` ya existe en el archivo.)

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila sin errores.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat: enlace de recuperacion en login"
```

---

### Task 10: Verificación E2E con Playwright

**Precondición:** servidor de desarrollo corriendo (`npm run dev`) y al menos un usuario de prueba en la BD local. El enlace de recuperación se leerá de la consola del servidor (modo desarrollo).

- [ ] **Step 1: Login muestra el enlace**

Navegar a `http://localhost:3000/login`. Verificar que aparece "¿Olvidaste tu contraseña?" y que enlaza a `/recuperar-password`.

- [ ] **Step 2: Solicitar recuperación**

Ir a `/recuperar-password`, escribir el email de un usuario existente, enviar. Verificar que aparece el mensaje genérico verde.

- [ ] **Step 3: Obtener el token**

Leer la consola del servidor `npm run dev`: copiar el enlace impreso (`http://localhost:3000/restablecer-password?token=...`).

- [ ] **Step 4: Restablecer**

Navegar al enlace. Escribir una nueva contraseña en ambos campos (≥6 caracteres), enviar. Verificar mensaje de éxito y redirección a `/login`.

- [ ] **Step 5: Login con la nueva contraseña**

En `/login`, iniciar sesión con el email y la **nueva** contraseña. Verificar que entra al `/dashboard`.

- [ ] **Step 6: Caso de error — token inválido**

Navegar a `/restablecer-password?token=tokenfalso123`, intentar cambiar la contraseña. Verificar el mensaje "Este enlace no es válido o ya fue utilizado."

- [ ] **Step 7: Confirmar build limpio final**

Run: `npm run build`
Expected: compila sin errores ni warnings de Dynamic server usage en las rutas nuevas.

---

### Task 11: Notas de despliegue (VPS)

No es código, es documentación de los pasos que se ejecutarán en el VPS al desplegar. Añadir una sección al archivo `DESPLIEGUE.md`:

- [ ] **Step 1: Documentar en DESPLIEGUE.md**

Añadir sección explicando que tras el `git pull` en el VPS hay que:
1. `npm install` (instala nodemailer)
2. `npx prisma migrate deploy` (crea la tabla `PasswordResetToken`)
3. Añadir al `.env` del VPS las variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, y confirmar que `NEXTAUTH_URL` apunta al dominio real (https).
4. `npm run build` + reinicio PM2 (el `deploy.sh` ya hace build y restart; agregar el `migrate deploy` al script).

- [ ] **Step 2: Commit**

```bash
git add DESPLIEGUE.md
git commit -m "docs: pasos de despliegue para recuperacion de contrasena"
```

---

## Self-Review

**Cobertura del spec:**
- Flujo usuario → Tasks 5–9 ✓
- Modelo `PasswordResetToken` (hash, expiración 1h) → Task 2 ✓
- Endpoints forgot/reset → Tasks 5, 6 ✓
- Páginas recuperar/restablecer + enlace login → Tasks 7, 8, 9 ✓
- `lib/mail.ts` + `lib/tokens.ts` → Tasks 3, 4 ✓
- Variables `.env` + nodemailer → Task 1 ✓
- Mensaje genérico (privacidad) → Task 5 ✓
- Manejo de errores (token inválido/expirado, SMTP) → Tasks 6, 4, 5 ✓
- Modo desarrollo (token en consola) → Task 4 ✓
- Pruebas Playwright → Task 10 ✓
- Despliegue VPS (migrate deploy) → Task 11 ✓
- Middleware sin cambios (verificado) → no requiere task ✓

**Consistencia de tipos/nombres:** `generarTokenRecuperacion`, `hashearToken`, `expiracionUnaHora` (Task 3) se usan idénticos en Task 5; `enviarEmailRecuperacion` (Task 4) idéntico en Task 5; `prisma.passwordResetToken` consistente en Tasks 5, 6. Campos `email`, `token`, `expires`, `id` coinciden con el modelo de Task 2.

**Placeholders:** ninguno — todo el código está completo.
