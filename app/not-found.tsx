import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">🔍</div>
        <h2 className="text-3xl font-bold text-white">404 - Página no encontrada</h2>
        <p className="text-white/60 max-w-md">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
