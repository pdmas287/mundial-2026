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
