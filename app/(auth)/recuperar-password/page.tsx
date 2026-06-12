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
