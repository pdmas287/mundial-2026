import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="font-orbitron text-xl font-bold gradient-text">MUNDIAL 2026</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#caracteristicas" className="text-white/70 hover:text-white transition-colors">Caracteristicas</a>
              <a href="#como-funciona" className="text-white/70 hover:text-white transition-colors">Como Funciona</a>
              <a href="#clasificacion" className="text-white/70 hover:text-white transition-colors">Clasificacion</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium">
                Iniciar Sesion
              </Link>
              <Link href="/registro" className="btn-predict px-5 py-2 rounded-full text-black font-bold text-sm">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-sm">Inscripciones abiertas - Copa del Mundo 2026</span>
          </div>

          <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black mb-6">
            <span className="text-white">PREDICE EL</span>
            <br />
            <span className="gradient-text">MUNDIAL 2026</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Compite con tus amigos prediciendo los resultados de todos los partidos.
            Demuestra que eres el mejor pronosticador y disfruta la emocion del mundial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/registro"
              className="btn-predict px-10 py-4 rounded-full text-black font-bold text-lg flex items-center gap-2 group"
            >
              Comenzar Ahora
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="glass px-10 py-4 rounded-full text-white font-semibold hover:bg-white/10 transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="font-orbitron text-3xl md:text-4xl font-bold text-cyan-400 mb-1">48</div>
              <div className="text-white/60 text-sm">Selecciones</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="font-orbitron text-3xl md:text-4xl font-bold text-yellow-400 mb-1">104</div>
              <div className="text-white/60 text-sm">Partidos</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="font-orbitron text-3xl md:text-4xl font-bold text-green-400 mb-1">12</div>
              <div className="text-white/60 text-sm">Grupos</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="font-orbitron text-3xl md:text-4xl font-bold text-purple-400 mb-1">3</div>
              <div className="text-white/60 text-sm">Paises Sede</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              Por que elegirnos
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              La plataforma mas completa para vivir la emocion del Mundial 2026
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Predicciones en Tiempo Real</h3>
              <p className="text-white/60 leading-relaxed">
                Realiza tus predicciones hasta el inicio de cada partido. Sistema de puntuacion justo y transparente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Brackets Eliminatorias</h3>
              <p className="text-white/60 leading-relaxed">
                Predice el camino al campeonato con brackets interactivos. Puntos extra por acertar en fases eliminatorias.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Ranking en Vivo</h3>
              <p className="text-white/60 leading-relaxed">
                Sigue tu posicion en el ranking general. Compara tus predicciones con otros participantes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Notificaciones</h3>
              <p className="text-white/60 leading-relaxed">
                Recibe alertas antes de cada partido para que nunca olvides hacer tu prediccion.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center mb-6">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Perfil Personalizado</h3>
              <p className="text-white/60 leading-relaxed">
                Tu propio perfil con estadisticas detalladas, historial de predicciones y logros desbloqueados.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">Diseno Responsivo</h3>
              <p className="text-white/60 leading-relaxed">
                Accede desde cualquier dispositivo. Interfaz optimizada para movil, tablet y escritorio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Participa en 3 simples pasos y comienza a competir
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="glass rounded-2xl p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center mx-auto mb-6">
                  <span className="font-orbitron text-2xl font-bold text-black">1</span>
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">Registrate</h3>
                <p className="text-white/60">
                  Crea tu cuenta gratis en menos de un minuto. Solo necesitas un email y una contrasena.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent transform translate-x-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="glass rounded-2xl p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                  <span className="font-orbitron text-2xl font-bold text-black">2</span>
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">Predice</h3>
                <p className="text-white/60">
                  Ingresa tus predicciones para cada partido antes de que comience. Puedes modificarlas hasta el pitazo inicial.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 w-1/2 h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent transform translate-x-1/2" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="glass rounded-2xl p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <span className="font-orbitron text-2xl font-bold text-black">3</span>
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">Gana</h3>
                <p className="text-white/60">
                  Acumula puntos por cada prediccion correcta. Escala en el ranking y gana premios increibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              Sistema de Puntuacion
            </h2>
            <p className="text-white/60 text-lg">
              Gana puntos segun la precision de tus predicciones
            </p>
          </div>

          <div className="glass rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Fase de Grupos */}
              <div>
                <h3 className="font-orbitron text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                  <span>📋</span> Fase de Grupos
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Resultado exacto</span>
                    <span className="font-orbitron text-green-400 font-bold">+5 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Ganador correcto</span>
                    <span className="font-orbitron text-yellow-400 font-bold">+3 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Empate correcto</span>
                    <span className="font-orbitron text-yellow-400 font-bold">+3 pts</span>
                  </div>
                </div>
              </div>

              {/* Eliminatorias */}
              <div>
                <h3 className="font-orbitron text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                  <span>🏆</span> Eliminatorias
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Resultado exacto</span>
                    <span className="font-orbitron text-green-400 font-bold">+8 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Ganador correcto</span>
                    <span className="font-orbitron text-yellow-400 font-bold">+5 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className="text-white/80">Penales correctos</span>
                    <span className="font-orbitron text-blue-400 font-bold">+2 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classification Section */}
      <section id="clasificacion" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              Clasificacion
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Compite por la gloria y demuestra quien sabe mas de futbol
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="glass rounded-2xl p-8 text-center order-2 md:order-1 md:mt-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🥈</span>
              </div>
              <h3 className="font-orbitron text-2xl font-bold text-gray-300 mb-2">2do Lugar</h3>
              <p className="text-white/60 mb-4">Segundo mejor pronosticador</p>
              <div className="font-orbitron text-xl font-bold text-gray-300">Subcampeon</div>
            </div>

            {/* 1st Place */}
            <div className="glass rounded-2xl p-8 text-center border-2 border-yellow-400/50 order-1 md:order-2 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">CAMPEON</span>
              </div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-5xl">🥇</span>
              </div>
              <h3 className="font-orbitron text-2xl font-bold text-yellow-400 mb-2">1er Lugar</h3>
              <p className="text-white/60 mb-4">Mejor pronosticador general</p>
              <div className="font-orbitron text-2xl font-bold gradient-text">La Gloria Eterna</div>
            </div>

            {/* 3rd Place */}
            <div className="glass rounded-2xl p-8 text-center order-3 md:mt-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🥉</span>
              </div>
              <h3 className="font-orbitron text-2xl font-bold text-amber-600 mb-2">3er Lugar</h3>
              <p className="text-white/60 mb-4">Tercer mejor pronosticador</p>
              <div className="font-orbitron text-xl font-bold text-amber-500">Podio de Honor</div>
            </div>
          </div>

          {/* Fun note */}
          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              Participacion 100% gratuita. Sin premios monetarios, solo la satisfaccion de ser el mejor pronosticador entre tus amigos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />

            <div className="relative z-10">
              <span className="text-6xl mb-6 block">⚽</span>
              <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-6">
                Listo para competir?
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
                Unete ahora y demuestra que eres el mejor pronosticador del Mundial 2026. Participacion gratuita, solo por diversion.
              </p>
              <Link
                href="/registro"
                className="btn-predict px-12 py-4 rounded-full text-black font-bold text-lg inline-flex items-center gap-2 group"
              >
                Crear Cuenta Gratis
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚽</span>
                <span className="font-orbitron text-xl font-bold gradient-text">MUNDIAL 2026</span>
              </div>
              <p className="text-white/60 max-w-sm mb-6">
                La mejor plataforma de predicciones para la Copa del Mundo FIFA 2026.
                Compite con amigos y demuestra tu conocimiento del futbol.
              </p>
              <div className="flex gap-4">
                <span className="text-2xl" title="USA">🇺🇸</span>
                <span className="text-2xl" title="Mexico">🇲🇽</span>
                <span className="text-2xl" title="Canada">🇨🇦</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-orbitron text-white font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li><a href="#caracteristicas" className="text-white/60 hover:text-white transition-colors">Caracteristicas</a></li>
                <li><a href="#como-funciona" className="text-white/60 hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#clasificacion" className="text-white/60 hover:text-white transition-colors">Clasificacion</a></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-orbitron text-white font-bold mb-4">Cuenta</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-white/60 hover:text-white transition-colors">Iniciar Sesion</Link></li>
                <li><Link href="/registro" className="text-white/60 hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-orbitron text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-white/60 hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
                <li><Link href="/privacidad" className="text-white/60 hover:text-white transition-colors">Politica de Privacidad</Link></li>
                <li><Link href="/terminos" className="text-white/60 hover:text-white transition-colors">Terminos de Uso</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              2025 Mundial 2026 Predicciones. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-white/40 text-sm">
              <Link href="/faq" className="hover:text-white/60 transition-colors">FAQ</Link>
              <Link href="/privacidad" className="hover:text-white/60 transition-colors">Privacidad</Link>
              <Link href="/terminos" className="hover:text-white/60 transition-colors">Terminos</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
