import Link from 'next/link'

export const metadata = {
  title: 'Terminos de Uso | Mundial 2026 Predicciones',
  description: 'Terminos y condiciones de uso de la plataforma de predicciones del Mundial 2026.',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="font-orbitron text-xl font-bold gradient-text">MUNDIAL 2026</span>
            </Link>
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass rounded-2xl p-8 md:p-12">
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-2">
            Terminos de Uso
          </h1>
          <p className="text-white/50 mb-8">Ultima actualizacion: Enero 2025</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">1. Aceptacion de los Terminos</h2>
              <p className="leading-relaxed">
                Al registrarte y utilizar Mundial 2026 Predicciones, aceptas estos terminos de uso
                en su totalidad. Si no estas de acuerdo con alguno de estos terminos, no debes
                utilizar la plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">2. Descripcion del Servicio</h2>
              <p className="leading-relaxed mb-4">
                Mundial 2026 Predicciones es una plataforma gratuita de entretenimiento que permite
                a los usuarios:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Registrar predicciones sobre los resultados de los partidos del Mundial 2026.</li>
                <li>Competir en un ranking con otros usuarios.</li>
                <li>Visualizar estadisticas y brackets del torneo.</li>
                <li>Participar en una competencia amistosa sin fines de lucro.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">3. Naturaleza Gratuita y Sin Premios</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-yellow-400 font-semibold">
                  Esta plataforma es 100% gratuita y NO ofrece premios monetarios ni materiales.
                </p>
              </div>
              <p className="leading-relaxed">
                La participacion es exclusivamente por diversion y entretenimiento. La clasificacion
                en el ranking no otorga ningun derecho a recibir premios, compensaciones o beneficios
                de ninguna naturaleza. El unico premio es la satisfaccion personal y el reconocimiento
                entre los participantes.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">4. Registro de Usuario</h2>
              <p className="leading-relaxed mb-4">
                Para utilizar la plataforma debes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar informacion veraz y actualizada.</li>
                <li>Ser mayor de 13 anos.</li>
                <li>Mantener la confidencialidad de tu contrasena.</li>
                <li>Ser responsable de toda actividad en tu cuenta.</li>
                <li>Notificarnos inmediatamente si sospechas uso no autorizado.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">5. Reglas de las Predicciones</h2>
              <p className="leading-relaxed mb-4">
                Las predicciones estan sujetas a las siguientes reglas:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Solo puedes realizar predicciones antes de que comience cada partido.</li>
                <li>Una vez iniciado el partido, no podras modificar tu prediccion.</li>
                <li>Los puntos se calculan automaticamente segun el sistema de puntuacion establecido.</li>
                <li>Las decisiones sobre resultados se basan en datos oficiales de FIFA.</li>
                <li>En caso de partidos suspendidos o cancelados, las predicciones seran anuladas.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">6. Conducta del Usuario</h2>
              <p className="leading-relaxed mb-4">
                Al usar la plataforma, te comprometes a NO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Crear multiples cuentas para manipular el ranking.</li>
                <li>Utilizar bots o scripts automatizados.</li>
                <li>Intentar acceder a cuentas de otros usuarios.</li>
                <li>Interferir con el funcionamiento de la plataforma.</li>
                <li>Utilizar nombres de usuario ofensivos o inapropiados.</li>
                <li>Compartir contenido ilegal o danino.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">7. Suspension y Terminacion</h2>
              <p className="leading-relaxed">
                Nos reservamos el derecho de suspender o eliminar cuentas que violen estos terminos,
                sin previo aviso. Tambien puedes eliminar tu cuenta en cualquier momento desde la
                configuracion de tu perfil.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">8. Propiedad Intelectual</h2>
              <p className="leading-relaxed">
                Todo el contenido de la plataforma (diseno, codigo, graficos, logos) es propiedad
                de Mundial 2026 Predicciones o se usa con autorizacion. Los nombres, logos y marcas
                de FIFA, selecciones nacionales y el Mundial son propiedad de sus respectivos duenos
                y se utilizan unicamente con fines informativos.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">9. Limitacion de Responsabilidad</h2>
              <p className="leading-relaxed">
                La plataforma se proporciona tal cual, sin garantias de ninguna naturaleza.
                No somos responsables por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Interrupciones del servicio o errores tecnicos.</li>
                <li>Perdida de datos o predicciones.</li>
                <li>Inexactitudes en la informacion mostrada.</li>
                <li>Danos derivados del uso de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">10. Modificaciones</h2>
              <p className="leading-relaxed">
                Podemos modificar estos terminos en cualquier momento. Los cambios entraran en vigor
                inmediatamente despues de su publicacion. El uso continuado de la plataforma despues
                de los cambios constituye tu aceptacion de los nuevos terminos.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">11. Ley Aplicable</h2>
              <p className="leading-relaxed">
                Estos terminos se rigen por las leyes aplicables en la jurisdiccion donde opera
                la plataforma. Cualquier disputa sera resuelta mediante los tribunales competentes
                de dicha jurisdiccion.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">12. Contacto</h2>
              <p className="leading-relaxed">
                Si tienes preguntas sobre estos terminos de uso, puedes contactarnos a traves de
                la plataforma.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            2025 Mundial 2026 Predicciones. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
