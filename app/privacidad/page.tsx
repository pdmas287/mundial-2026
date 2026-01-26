import Link from 'next/link'

export const metadata = {
  title: 'Politica de Privacidad | Mundial 2026 Predicciones',
  description: 'Politica de privacidad de la plataforma de predicciones del Mundial 2026.',
}

export default function PrivacidadPage() {
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
            Politica de Privacidad
          </h1>
          <p className="text-white/50 mb-8">Ultima actualizacion: Enero 2025</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">1. Informacion que Recopilamos</h2>
              <p className="leading-relaxed mb-4">
                En Mundial 2026 Predicciones recopilamos la siguiente informacion cuando te registras y utilizas nuestra plataforma:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Datos de registro:</strong> Nombre, direccion de correo electronico y contrasena.</li>
                <li><strong className="text-white">Datos de uso:</strong> Predicciones realizadas, puntuacion obtenida y actividad en la plataforma.</li>
                <li><strong className="text-white">Datos tecnicos:</strong> Direccion IP, tipo de navegador y dispositivo utilizado.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">2. Uso de la Informacion</h2>
              <p className="leading-relaxed mb-4">
                Utilizamos tu informacion para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Crear y gestionar tu cuenta de usuario.</li>
                <li>Procesar y mostrar tus predicciones.</li>
                <li>Calcular y actualizar tu puntuacion en el ranking.</li>
                <li>Enviarte notificaciones sobre partidos proximos (si lo autorizas).</li>
                <li>Mejorar la experiencia de usuario en la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">3. Proteccion de Datos</h2>
              <p className="leading-relaxed">
                Tu contrasena se almacena de forma encriptada utilizando algoritmos de hash seguros (bcrypt).
                Nunca almacenamos contrasenas en texto plano. Implementamos medidas de seguridad tecnicas
                y organizativas para proteger tus datos personales contra acceso no autorizado, perdida o destruccion.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">4. Compartir Informacion</h2>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">No vendemos ni compartimos tu informacion personal con terceros</strong> con fines comerciales.
                La unica informacion visible para otros usuarios es:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tu nombre de usuario en el ranking publico.</li>
                <li>Tu puntuacion total.</li>
                <li>Tu posicion en la clasificacion.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">5. Cookies y Sesiones</h2>
              <p className="leading-relaxed">
                Utilizamos cookies tecnicas necesarias para el funcionamiento de la plataforma,
                incluyendo cookies de sesion para mantener tu autenticacion. No utilizamos cookies
                de seguimiento ni de publicidad.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">6. Tus Derechos</h2>
              <p className="leading-relaxed mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acceder a tus datos personales.</li>
                <li>Rectificar datos incorrectos.</li>
                <li>Solicitar la eliminacion de tu cuenta y datos asociados.</li>
                <li>Exportar tus datos en un formato legible.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">7. Retencion de Datos</h2>
              <p className="leading-relaxed">
                Mantenemos tus datos mientras tu cuenta este activa. Si decides eliminar tu cuenta,
                tus datos personales seran eliminados en un plazo maximo de 30 dias, aunque podemos
                conservar datos anonimizados con fines estadisticos.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">8. Menores de Edad</h2>
              <p className="leading-relaxed">
                Esta plataforma esta destinada a usuarios mayores de 13 anos. No recopilamos
                intencionadamente informacion de menores de esta edad. Si eres padre o tutor y
                crees que tu hijo nos ha proporcionado informacion, contactanos para eliminarla.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">9. Cambios en esta Politica</h2>
              <p className="leading-relaxed">
                Podemos actualizar esta politica de privacidad ocasionalmente. Te notificaremos
                sobre cambios significativos mediante un aviso en la plataforma. Te recomendamos
                revisar esta pagina periodicamente.
              </p>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">10. Contacto</h2>
              <p className="leading-relaxed">
                Si tienes preguntas sobre esta politica de privacidad o sobre el tratamiento de
                tus datos, puedes contactarnos a traves de la plataforma.
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
