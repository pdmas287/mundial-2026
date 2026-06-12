# Diseño — Restablecer contraseña

**Fecha:** 2026-06-11
**Proyecto:** Mundial 2026 (Next.js 14 + Prisma 5 + NextAuth + PostgreSQL)

## Objetivo

Permitir que un usuario que olvidó su contraseña pueda restablecerla de forma
segura mediante un enlace enviado a su correo electrónico.

## Contexto actual (verificado)

- Autenticación con **NextAuth** (Credentials: email + password con bcrypt) en `auth.ts`.
- Registro propio en `app/api/auth/register/route.ts`.
- Modelo `User` en `prisma/schema.prisma` con `email` (único) y `password` (hash bcrypt).
- Middleware (`auth.config.ts`) solo protege `/dashboard`; el resto de rutas son
  públicas por defecto (`return true`). **No requiere cambios.**
- **No existe** ninguna función de recuperación de contraseña actualmente.

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Entrega del enlace | Email real |
| Proveedor de email | **SMTP de Hostinger** vía Nodemailer (transaccional, permitido por ToS) |
| Email no registrado | Mensaje genérico (no revela si el correo existe) |
| Expiración del token | **1 hora** |
| Token | De un solo uso; se borra al usarse. Se guarda **hasheado** (SHA-256) en BD |

> Nota: Hostinger Reach fue descartado — es email marketing (newsletters/campañas),
> no email transaccional. El SMTP estándar de Hostinger sí permite transaccional.

## Flujo del usuario

```
[Login] → clic "¿Olvidaste tu contraseña?"
   ↓
[/recuperar-password] → ingresa email → "Enviar enlace"
   ↓
(siempre) mensaje genérico: "Si el email existe, te enviamos un enlace"
   ↓
Si el email existe → correo SMTP con enlace seguro
   ↓
[/restablecer-password?token=xxx] → nueva contraseña (x2)
   ↓
Token validado → contraseña actualizada → redirige a [/login]
```

## Cambios técnicos

### Base de datos (Prisma) — nuevo modelo

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique   // hash SHA-256 del token (no el token en claro)
  expires   DateTime           // createdAt + 1 hora
  createdAt DateTime @default(now())

  @@index([email])
}
```

Requiere `npx prisma migrate dev` (local) y `npx prisma migrate deploy` (VPS).
El modelo `User` **no se modifica**.

### Endpoints nuevos

| Endpoint | Responsabilidad |
|---|---|
| `POST /api/auth/forgot-password` | Recibe `{ email }`. Si existe el usuario: genera token, guarda su hash con expiración 1h, envía correo. **Siempre** responde 200 con mensaje genérico. Borra tokens previos del mismo email. |
| `POST /api/auth/reset-password` | Recibe `{ token, password }`. Hashea el token recibido, lo busca en BD, valida que exista y no esté expirado. Si es válido: actualiza `User.password` (bcrypt, 10 rounds), borra el token. |

Ambos con `export const dynamic = 'force-dynamic'` (usan request/headers) y validación con Zod.

### Páginas nuevas (UI)

| Página | Contenido |
|---|---|
| `/recuperar-password` | Form con campo email + botón. Tras enviar, muestra mensaje genérico de confirmación. Enlace de vuelta a login. |
| `/restablecer-password` | Lee `?token=` de la URL. Form con nueva contraseña + confirmación. Valida coincidencia y mín. 6 caracteres. Maneja estados: token válido / inválido / expirado. |

### Edición de UI existente

- `/login`: añadir enlace **"¿Olvidaste tu contraseña?"** que apunta a `/recuperar-password`.

### Utilidades nuevas

| Archivo | Propósito |
|---|---|
| `lib/mail.ts` | Configura Nodemailer con SMTP de Hostinger (credenciales desde `.env`). Exporta `enviarEmailRecuperacion(email, enlace)`. Plantilla HTML simple del correo. |
| `lib/tokens.ts` | Helpers: generar token aleatorio (crypto), hashear (SHA-256), calcular expiración. |

### Variables de entorno nuevas (`.env`)

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@tudominio.com
SMTP_PASS=********
SMTP_FROM="Mundial 2026 <info@tudominio.com>"
NEXTAUTH_URL=https://tudominio.com   # base para construir el enlace
```

(Valores reales se configuran en el VPS; en local pueden quedar vacíos y el token
se imprime en consola para pruebas.)

### Dependencias nuevas

- `nodemailer`
- `@types/nodemailer` (devDependency)

### Middleware

Sin cambios. Las rutas nuevas son públicas por el `return true` por defecto.

## Manejo de errores

| Situación | Comportamiento |
|---|---|
| Email no registrado | Mensaje genérico (no se envía correo, pero el usuario ve lo mismo) |
| Falla envío SMTP | Se loguea en servidor; el usuario ve el mensaje genérico |
| Token inexistente o ya usado | "Este enlace no es válido o ya fue utilizado" |
| Token expirado (>1h) | "Este enlace expiró. Solicita uno nuevo" + enlace a `/recuperar-password` |
| Contraseñas no coinciden | Validación en el formulario |
| Contraseña < 6 caracteres | Mismo criterio que el registro (Zod) |

## Modo desarrollo

Cuando `NODE_ENV !== 'production'` o falten credenciales SMTP, el enlace de
recuperación se imprime en la consola del servidor en vez de (o además de)
enviarse por correo, para permitir pruebas locales sin SMTP.

## Pruebas (Playwright, end-to-end)

1. `/login` muestra el enlace "¿Olvidaste tu contraseña?".
2. `/recuperar-password`: enviar email → aparece mensaje genérico.
3. Tomar el token (consola dev o BD) → `/restablecer-password?token=xxx`.
4. Cambiar contraseña → redirección a `/login`.
5. Login con la **nueva** contraseña → entra correctamente.
6. Token inválido → mensaje de error correcto.

El envío SMTP real se valida en el VPS; en local se valida toda la lógica.

## Despliegue (resumen, se detalla en plan de implementación)

1. `git pull` en el VPS.
2. `npm install` (trae nodemailer).
3. `npx prisma migrate deploy` (crea la tabla `PasswordResetToken`).
4. Añadir las variables SMTP al `.env` del VPS.
5. `npm run build` + reinicio PM2 (vía `deploy.sh` existente).

## Fuera de alcance (YAGNI)

- Rate limiting / captcha en el formulario (se puede añadir después si hay abuso).
- Recuperación por SMS.
- Cambio de contraseña desde el perfil estando logueado (es otra función distinta).
