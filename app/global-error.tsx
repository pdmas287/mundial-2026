'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
          <div className="text-center space-y-6 p-8">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-3xl font-bold text-white">Error Global</h2>
            <p className="text-white/60 max-w-md">
              Ha ocurrido un error crítico. Por favor, recarga la página.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
