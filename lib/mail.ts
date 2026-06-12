import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function enviarEmailRecuperacion(email: string, enlace: string) {
  // En desarrollo o sin credenciales: imprimir el enlace en consola y no enviar.
  const sinCredenciales = !process.env.SMTP_HOST || !process.env.SMTP_USER
  if (process.env.NODE_ENV !== 'production' || sinCredenciales) {
    console.log('========================================')
    console.log('ENLACE DE RECUPERACION (modo desarrollo):')
    console.log(enlace)
    console.log('========================================')
    if (sinCredenciales) return
  }

  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Recupera tu contraseña - Mundial 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #302b63;">⚽ Mundial 2026</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en 1 hora.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${enlace}" style="background: #302b63; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #888; font-size: 13px;">Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.</p>
      </div>
    `,
  })
}
