export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <span className="text-6xl">⚽</span>
        </div>
        <h1 className="font-orbitron text-6xl font-black mb-4 gradient-text">
          MUNDIAL 2026
        </h1>
        <p className="text-white/70 text-xl mb-8 tracking-widest">
          PREDICCIONES
        </p>
        <div className="flex gap-4 justify-center">
          <button className="glass px-8 py-3 rounded-full text-white font-semibold hover:bg-white/10 transition-all">
            Iniciar Sesión
          </button>
          <button className="btn-predict px-8 py-3 rounded-full text-black font-bold">
            Registrarse
          </button>
        </div>
      </div>
    </main>
  );
}
