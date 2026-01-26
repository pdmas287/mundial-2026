import Link from 'next/link'

export const metadata = {
  title: 'Preguntas Frecuentes | Mundial 2026 Predicciones',
  description: 'Respuestas a las preguntas mas frecuentes sobre la plataforma de predicciones del Mundial 2026.',
}

const faqs = [
  {
    categoria: 'General',
    preguntas: [
      {
        pregunta: 'Que es Mundial 2026 Predicciones?',
        respuesta: 'Es una plataforma gratuita donde puedes predecir los resultados de los partidos del Mundial de Futbol 2026. Compites con otros usuarios en un ranking basado en la precision de tus predicciones.'
      },
      {
        pregunta: 'Es gratis participar?',
        respuesta: 'Si, la plataforma es 100% gratuita. No hay costos de inscripcion ni tarifas ocultas. Participas solo por diversion y para demostrar tus conocimientos de futbol.'
      },
      {
        pregunta: 'Hay premios?',
        respuesta: 'No hay premios monetarios ni materiales. La unica recompensa es la satisfaccion de quedar en los primeros lugares del ranking y presumir ante tus amigos que eres el mejor pronosticador.'
      },
      {
        pregunta: 'Quien puede participar?',
        respuesta: 'Cualquier persona mayor de 13 anos puede registrarse y participar. Solo necesitas un correo electronico valido.'
      }
    ]
  },
  {
    categoria: 'Predicciones',
    preguntas: [
      {
        pregunta: 'Como hago una prediccion?',
        respuesta: 'Entra a la seccion de Predicciones o Calendario, selecciona un partido y escribe el resultado que crees que sera (goles del equipo local y visitante). Guarda tu prediccion y listo.'
      },
      {
        pregunta: 'Hasta cuando puedo hacer mis predicciones?',
        respuesta: 'Puedes hacer o modificar tus predicciones hasta el momento en que comienza el partido. Una vez que el partido inicia, la prediccion queda bloqueada.'
      },
      {
        pregunta: 'Puedo cambiar una prediccion despues de hacerla?',
        respuesta: 'Si, puedes modificar tu prediccion cuantas veces quieras, siempre y cuando el partido no haya comenzado.'
      },
      {
        pregunta: 'Que pasa si olvido hacer una prediccion?',
        respuesta: 'Si no haces prediccion para un partido, simplemente no recibes puntos por ese partido. No hay penalizacion, pero pierdes la oportunidad de sumar puntos.'
      },
      {
        pregunta: 'Como funcionan las predicciones en eliminatorias con penales?',
        respuesta: 'En fase de eliminatorias, si predices un empate, podras tambien indicar quien crees que ganara en penales. Si el partido va a penales y aciertas el ganador, recibes puntos adicionales.'
      }
    ]
  },
  {
    categoria: 'Sistema de Puntos',
    preguntas: [
      {
        pregunta: 'Como funciona el sistema de puntuacion?',
        respuesta: 'Ganas puntos segun la precision de tu prediccion. En fase de grupos: 5 puntos por resultado exacto, 3 puntos por acertar solo el ganador/empate. En eliminatorias los puntos son mayores.'
      },
      {
        pregunta: 'Cuantos puntos gano por resultado exacto?',
        respuesta: 'En fase de grupos ganas 5 puntos. En eliminatorias ganas 8 puntos. Adicionalmente, si aciertas el resultado de penales ganas 2 puntos extra.'
      },
      {
        pregunta: 'Que pasa si acierto el ganador pero no el marcador exacto?',
        respuesta: 'Recibes puntos parciales: 3 puntos en fase de grupos y 5 puntos en eliminatorias por acertar quien gana o si es empate.'
      },
      {
        pregunta: 'Por que en eliminatorias se ganan mas puntos?',
        respuesta: 'Porque hay menos partidos y son mas decisivos. Ademas, predecir resultados en fases finales es mas dificil.'
      }
    ]
  },
  {
    categoria: 'Ranking',
    preguntas: [
      {
        pregunta: 'Como funciona el ranking?',
        respuesta: 'El ranking ordena a todos los usuarios segun sus puntos totales acumulados. La persona con mas puntos esta en primer lugar.'
      },
      {
        pregunta: 'Cuando se actualiza el ranking?',
        respuesta: 'El ranking se actualiza automaticamente cada vez que finaliza un partido y se registra el resultado oficial.'
      },
      {
        pregunta: 'Que pasa si hay empate en puntos?',
        respuesta: 'En caso de empate en puntos, se consideran criterios de desempate como cantidad de resultados exactos acertados.'
      },
      {
        pregunta: 'Puedo ver el ranking de otros usuarios?',
        respuesta: 'Si, el ranking es publico y puedes ver la posicion, nombre y puntuacion de todos los participantes.'
      }
    ]
  },
  {
    categoria: 'Cuenta',
    preguntas: [
      {
        pregunta: 'Como creo una cuenta?',
        respuesta: 'Haz clic en "Registrarse", ingresa tu nombre, correo electronico y una contrasena de al menos 6 caracteres. Confirma y ya puedes empezar a hacer predicciones.'
      },
      {
        pregunta: 'Olvide mi contrasena, que hago?',
        respuesta: 'Por el momento, contacta al administrador para restablecer tu contrasena. Estamos trabajando en una funcion de recuperacion automatica.'
      },
      {
        pregunta: 'Puedo cambiar mi nombre de usuario?',
        respuesta: 'Si, puedes modificar tu nombre desde la seccion de Perfil en tu cuenta.'
      },
      {
        pregunta: 'Como elimino mi cuenta?',
        respuesta: 'Contacta al administrador para solicitar la eliminacion de tu cuenta. Tus datos seran eliminados en un plazo de 30 dias.'
      }
    ]
  },
  {
    categoria: 'Brackets',
    preguntas: [
      {
        pregunta: 'Que son los brackets?',
        respuesta: 'Los brackets son la visualizacion del cuadro de eliminatorias del Mundial. Muestran como avanzan los equipos desde octavos de final hasta la final.'
      },
      {
        pregunta: 'Puedo predecir el bracket completo?',
        respuesta: 'Puedes hacer predicciones partido por partido conforme se van definiendo los enfrentamientos. Los equipos se asignan automaticamente segun los resultados de la fase de grupos.'
      }
    ]
  }
]

export default function FAQPage() {
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
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-white/60 text-lg">
            Todo lo que necesitas saber sobre Mundial 2026 Predicciones
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((categoria, catIndex) => (
            <div key={catIndex} className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center text-sm">
                  {catIndex + 1}
                </span>
                {categoria.categoria}
              </h2>

              <div className="space-y-4">
                {categoria.preguntas.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group bg-white/5 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                      <span className="text-white font-medium pr-4">{faq.pregunta}</span>
                      <span className="text-cyan-400 flex-shrink-0 transition-transform group-open:rotate-180">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 text-white/70 leading-relaxed">
                      {faq.respuesta}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 glass rounded-2xl p-8 text-center">
          <h3 className="font-orbitron text-xl font-bold text-white mb-3">
            No encontraste tu respuesta?
          </h3>
          <p className="text-white/60 mb-6">
            Si tienes alguna otra pregunta, no dudes en contactarnos.
          </p>
          <Link
            href="/registro"
            className="btn-predict px-8 py-3 rounded-full text-black font-bold inline-flex items-center gap-2"
          >
            Crear cuenta y empezar
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
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
