# 🔐 Sistema de Autenticación

## ✅ Configuración Completada

El sistema de autenticación está implementado usando **NextAuth.js v5** con las siguientes características:

---

## 📋 Componentes Implementados

### 1. Configuración de NextAuth

**Archivos:**
- `auth.config.ts` - Configuración base de NextAuth
- `auth.ts` - Implementación completa con providers y callbacks
- `middleware.ts` - Protección de rutas automática

**Características:**
- ✅ Autenticación con credenciales (email/password)
- ✅ Sesiones basadas en JWT
- ✅ Integración con Prisma
- ✅ Protección automática de rutas

### 2. API Routes

**Rutas creadas:**

#### `POST /api/auth/register`
Registro de nuevos usuarios.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "...",
    "email": "juan@email.com",
    "nombre": "Juan Pérez",
    "createdAt": "..."
  }
}
```

**Validaciones:**
- Email válido
- Nombre mínimo 2 caracteres
- Contraseña mínimo 6 caracteres
- Email no duplicado

#### `GET/POST /api/auth/[...nextauth]`
Endpoints de NextAuth para login, logout, sesiones, etc.

### 3. Páginas de Autenticación

#### `/login` - Página de Inicio de Sesión
- Formulario de login
- Validación de credenciales
- Redirección automática al dashboard
- Link a registro
- Credenciales de prueba visibles

**Credenciales de prueba:**
- Email: `demo@mundial2026.com`
- Password: `password123`

#### `/registro` - Página de Registro
- Formulario de registro completo
- Validación de campos
- Confirmación de contraseña
- Auto-login después del registro
- Redirección automática al dashboard

### 4. Protección de Rutas

**Rutas protegidas:**
- `/dashboard/*` - Requiere autenticación

**Rutas públicas:**
- `/` - Landing page
- `/login` - Login
- `/registro` - Registro

**Comportamiento:**
- Usuario no autenticado en `/dashboard` → Redirige a `/login`
- Usuario autenticado en `/login` o `/registro` → Redirige a `/dashboard`
- Usuario autenticado en `/` → Redirige a `/dashboard`

### 5. Dashboard Básico

**Ruta:** `/dashboard`

**Características:**
- Header con información del usuario
- Botón de cerrar sesión
- Placeholder para futuras secciones
- Solo accesible con autenticación

---

## 🔧 Cómo Funciona

### Flujo de Registro

1. Usuario completa formulario en `/registro`
2. Se validan los datos (client-side)
3. Se envía POST a `/api/auth/register`
4. Se hashea la contraseña con bcrypt
5. Se crea el usuario en la base de datos
6. Auto-login con NextAuth
7. Redirección a `/dashboard`

### Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. Se envía a NextAuth con `signIn('credentials')`
3. NextAuth valida contra la base de datos
4. Si es correcto, crea sesión JWT
5. Redirección a `/dashboard`

### Flujo de Protección de Rutas

1. Usuario intenta acceder a `/dashboard`
2. Middleware intercepta la request
3. Verifica sesión con NextAuth
4. Si no hay sesión → Redirige a `/login`
5. Si hay sesión → Permite acceso

---

## 🧪 Testing Manual

### 1. Probar Registro
```
1. Ve a http://localhost:3000/registro
2. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: test@test.com
   - Password: test123
   - Confirmar: test123
3. Click en "Crear Cuenta"
4. Deberías ser redirigido a /dashboard
```

### 2. Probar Login
```
1. Ve a http://localhost:3000/login
2. Ingresa credenciales de prueba:
   - Email: demo@mundial2026.com
   - Password: password123
3. Click en "Iniciar Sesión"
4. Deberías ver el dashboard
```

### 3. Probar Protección de Rutas
```
1. Abre navegador en modo incógnito
2. Ve a http://localhost:3000/dashboard
3. Deberías ser redirigido a /login
4. Después de login, vuelves a /dashboard
```

### 4. Probar Logout
```
1. Estando logueado en /dashboard
2. Click en "Cerrar Sesión"
3. Deberías volver a la landing page
4. Intentar acceder a /dashboard te redirige a /login
```

---

## 🗃️ Base de Datos

### Tabla User

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  nombre        String
  password      String    // Hasheado con bcrypt
  avatar        String?
  puntosTotal   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  predicciones        Prediccion[]
  prediccionesPremios PrediccionPremio[]
}
```

**Campos importantes:**
- `email` - Único, usado para login
- `password` - Hasheado con bcrypt (salt rounds: 10)
- `nombre` - Nombre completo del usuario

---

## 🔒 Seguridad

### Implementado

✅ **Hash de contraseñas:** bcrypt con 10 salt rounds
✅ **Validación de datos:** Zod schemas
✅ **Sesiones JWT:** Firmadas y encriptadas
✅ **CSRF Protection:** Incluido en NextAuth
✅ **Middleware de protección:** Rutas protegidas automáticamente

### Variables de Entorno

```env
NEXTAUTH_SECRET="..." # Generado aleatoriamente
NEXTAUTH_URL="http://localhost:3000" # Cambiar en producción
```

**IMPORTANTE:**
- `NEXTAUTH_SECRET` debe ser diferente en producción
- Nunca commitear el archivo `.env`

---

## 📝 Tipos TypeScript

```typescript
// types/next-auth.d.ts
interface Session {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}
```

---

## 🚀 Próximos Pasos

Funcionalidades adicionales que se pueden implementar:

1. **Recuperación de contraseña**
   - Email con token
   - Reset password flow

2. **OAuth Providers**
   - Google
   - GitHub
   - Facebook

3. **Verificación de email**
   - Email de confirmación
   - Token de verificación

4. **2FA (Two-Factor Authentication)**
   - TOTP
   - SMS

5. **Gestión de sesiones**
   - Ver sesiones activas
   - Cerrar sesiones remotamente

6. **Perfil de usuario**
   - Editar información
   - Cambiar contraseña
   - Subir avatar

---

## 🐛 Troubleshooting

### Error: "Can't find user"
- Verifica que el email sea correcto
- Verifica que el usuario exista en la base de datos
- Usa Prisma Studio para verificar: `npm run db:studio`

### Error: "Invalid credentials"
- Verifica que la contraseña sea correcta
- Las contraseñas son case-sensitive

### Error: "Session not found"
- Limpia cookies del navegador
- Verifica que NEXTAUTH_SECRET esté configurado
- Reinicia el servidor de desarrollo

### Error: Redireccionamiento infinito
- Verifica que las rutas en `auth.config.ts` sean correctas
- Revisa la configuración del middleware

---

## ✅ Estado Actual

- ✅ NextAuth.js v5 configurado
- ✅ Login funcional
- ✅ Registro funcional
- ✅ Protección de rutas
- ✅ Sesiones JWT
- ✅ Dashboard básico
- ✅ Logout funcional
- ⬜ Recuperación de contraseña (Futuro)
- ⬜ OAuth providers (Futuro)
- ⬜ Perfil de usuario (Futuro)
