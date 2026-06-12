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
