# 🔐 Sistema de Roles y Permisos

## ✅ Implementación Completada

El sistema de roles está completamente implementado y funcional.

---

## 📊 Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **USER** | Usuario normal | Ver calendario, hacer predicciones, ver ranking, ver sus predicciones |
| **ADMIN** | Administrador | Todos los permisos de USER + Actualizar resultados de partidos, Recalcular puntos, Acceder al panel de administración |

---

## 🔧 Configuración Inicial

### 1. Usuario Administrador Principal

**Email:** `pdmas287@gmail.com`
**Contraseña:** `GraciasDios28.`
**Rol:** `ADMIN`

Este usuario ya fue creado automáticamente durante la implementación.

### 2. Crear Nuevos Administradores

Para convertir un usuario existente en administrador o crear uno nuevo:

```bash
npm run crear-admin
```

Este script:
- Si el usuario `pdmas287@gmail.com` existe, lo actualiza a ADMIN
- Si no existe, lo crea con rol ADMIN
- Usa las credenciales especificadas en el script

**Para modificar las credenciales del admin, edita:**
[scripts/crear-admin.ts:13-15](scripts/crear-admin.ts#L13-L15)

---

## 🏗️ Arquitectura del Sistema

### 1. Schema de Base de Datos

**Cambios en Prisma Schema:**

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  nombre        String
  password      String
  avatar        String?
  role          Role      @default(USER)  // ← NUEVO
  puntosTotal   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  predicciones        Prediccion[]
  prediccionesPremios PrediccionPremio[]
}

enum Role {
  USER
  ADMIN
}
```

**Archivo:** [prisma/schema.prisma:13-31](prisma/schema.prisma#L13-L31)

### 2. Tipos de TypeScript (NextAuth)

**Extensión de tipos para NextAuth:**

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: 'USER' | 'ADMIN'  // ← NUEVO
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image: string | null
    role: 'USER' | 'ADMIN'  // ← NUEVO
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'USER' | 'ADMIN'  // ← NUEVO
  }
}
```

**Archivo:** [types/next-auth.d.ts](types/next-auth.d.ts)

### 3. Autenticación (auth.ts)

El callback de autenticación ahora incluye el rol:

```typescript
async authorize(credentials) {
  // ... validaciones ...

  if (passwordsMatch) {
    return {
      id: user.id,
      email: user.email,
      name: user.nombre,
      image: user.avatar,
      role: user.role,  // ← NUEVO
    }
  }
}
```

**Callbacks JWT y Session:**

```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.name = user.name
    token.email = user.email
    token.picture = user.image
    token.role = user.role  // ← NUEVO
  }
  return token
}

async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.id as string
    session.user.name = token.name
    session.user.email = token.email as string
    session.user.image = token.picture as string | null
    session.user.role = token.role as 'USER' | 'ADMIN'  // ← NUEVO
  }
  return session
}
```

**Archivo:** [auth.ts:55-76](auth.ts#L55-L76)

---

## 🛡️ Protecciones Implementadas

### 1. Protección de APIs

#### API: Actualizar Resultado de Partido

**Endpoint:** `POST /api/partidos/[id]/resultado`

```typescript
const session = await auth()

// Verificar autenticación
if (!session?.user?.id) {
  return NextResponse.json(
    { error: 'No autenticado' },
    { status: 401 }
  )
}

// Verificar rol ADMIN
if (session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'No tienes permisos para realizar esta acción' },
    { status: 403 }
  )
}
```

**Archivo:** [app/api/partidos/[id]/resultado/route.ts:18-35](app/api/partidos/[id]/resultado/route.ts#L18-L35)

#### API: Recalcular Puntos

**Endpoint:** `POST /api/admin/recalcular-puntos`

```typescript
const session = await auth()

if (!session?.user?.id) {
  return NextResponse.json(
    { error: 'No autenticado' },
    { status: 401 }
  )
}

// Solo administradores pueden recalcular puntos
if (session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'No tienes permisos para realizar esta acción' },
    { status: 403 }
  )
}
```

**Archivo:** [app/api/admin/recalcular-puntos/route.ts:7-23](app/api/admin/recalcular-puntos/route.ts#L7-L23)

### 2. Protección de Páginas

#### Página: Panel de Administración

**Ruta:** `/dashboard/admin`

```typescript
const { data: session, status } = useSession()

// Verificar si el usuario es administrador
useEffect(() => {
  if (status === 'loading') return

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }
}, [session, status])

// Mostrar loading mientras verifica permisos
if (status === 'loading' || !session) {
  return (
    <div className="text-center py-12">
      <div className="inline-block h-12 w-12 animate-spin..."></div>
      <p className="text-white/60 mt-4">Verificando permisos...</p>
    </div>
  )
}
```

**Archivo:** [app/dashboard/admin/page.tsx:16-109](app/dashboard/admin/page.tsx#L16-L109)

### 3. Menú de Navegación Condicional

El enlace "Admin" solo se muestra para usuarios con rol ADMIN:

```typescript
const navItems = [
  { href: '/dashboard', label: '📊 Resumen', icon: '📊', adminOnly: false },
  { href: '/dashboard/calendario', label: '📅 Calendario', icon: '📅', adminOnly: false },
  { href: '/dashboard/predicciones', label: '🎯 Mis Predicciones', icon: '🎯', adminOnly: false },
  { href: '/dashboard/ranking', label: '🏆 Ranking', icon: '🏆', adminOnly: false },
  { href: '/dashboard/premios', label: '🥇 Premios', icon: '🥇', adminOnly: false },
  { href: '/dashboard/admin', label: '⚙️ Admin', icon: '⚙️', adminOnly: true },
]

// Filtrar items basados en el rol del usuario
const filteredNavItems = navItems.filter(item => {
  if (item.adminOnly) {
    return session.user?.role === 'ADMIN'
  }
  return true
})
```

**Archivo:** [app/dashboard/layout.tsx:17-32](app/dashboard/layout.tsx#L17-L32)

### 4. Registro de Nuevos Usuarios

Todos los nuevos usuarios se crean automáticamente con rol `USER`:

```typescript
const user = await prisma.user.create({
  data: {
    email,
    nombre,
    password: hashedPassword,
    role: 'USER', // ← Todos los nuevos usuarios son USER por defecto
    puntosTotal: 0,
  },
  select: {
    id: true,
    email: true,
    nombre: true,
    role: true,
    createdAt: true,
  },
})
```

**Archivo:** [app/api/auth/register/route.ts:36-51](app/api/auth/register/route.ts#L36-L51)

---

## 🧪 Testing

### Opción 1: Prueba Manual (Recomendado)

1. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Probar como Usuario Normal:**
   - Ir a `http://localhost:3001/register`
   - Crear una cuenta nueva (ej: `usuario@test.com`)
   - Iniciar sesión
   - ✅ Verificar que NO aparece el enlace "Admin" en el menú
   - ❌ Intentar acceder a `http://localhost:3001/dashboard/admin`
   - ✅ Verificar que redirige a `/dashboard`

3. **Probar como Administrador:**
   - Cerrar sesión
   - Iniciar sesión con:
     - Email: `pdmas287@gmail.com`
     - Contraseña: `GraciasDios28.`
   - ✅ Verificar que SÍ aparece el enlace "Admin" en el menú
   - ✅ Acceder a `/dashboard/admin`
   - ✅ Verificar que puede actualizar resultados
   - ✅ Verificar que puede recalcular puntos

### Opción 2: Prueba de APIs con cURL

```bash
# 1. Intentar actualizar resultado SIN autenticación
curl -X POST http://localhost:3001/api/partidos/[ID]/resultado \
  -H "Content-Type: application/json" \
  -d '{"golesLocal": 2, "golesVisitante": 1}'

# Resultado esperado: 401 Unauthorized

# 2. Intentar actualizar resultado como USER (requiere token de sesión)
# Resultado esperado: 403 Forbidden

# 3. Actualizar resultado como ADMIN (requiere token de sesión)
# Resultado esperado: 200 OK
```

---

## 📝 Flujo de Permisos

### Escenario 1: Usuario Normal Intenta Acceder al Admin

```
Usuario Normal (USER) → /dashboard/admin
  ↓
useEffect verifica session.user.role
  ↓
role !== 'ADMIN' → redirect('/dashboard')
  ↓
Usuario redirigido al dashboard principal
```

### Escenario 2: Usuario Normal Intenta Actualizar Resultado

```
Usuario Normal (USER) → POST /api/partidos/[id]/resultado
  ↓
API verifica session.user.role
  ↓
role !== 'ADMIN' → 403 Forbidden
  ↓
Error: "No tienes permisos para realizar esta acción"
```

### Escenario 3: Administrador Actualiza Resultado

```
Administrador (ADMIN) → POST /api/partidos/[id]/resultado
  ↓
API verifica session.user.role
  ↓
role === 'ADMIN' → ✅ Continuar
  ↓
Actualizar partido, calcular puntos, actualizar usuarios
  ↓
200 OK con resumen de cambios
```

---

## 🔍 Validaciones de Seguridad

### Nivel 1: Base de Datos
- ✅ Campo `role` en modelo User
- ✅ Enum `Role` con valores válidos (USER, ADMIN)
- ✅ Valor por defecto: `USER`

### Nivel 2: Autenticación
- ✅ Rol incluido en JWT token
- ✅ Rol incluido en sesión de NextAuth
- ✅ Tipos TypeScript verifican rol en compilación

### Nivel 3: APIs (Backend)
- ✅ Verificación de autenticación (401 si no autenticado)
- ✅ Verificación de rol ADMIN (403 si no es admin)
- ✅ Mensajes de error descriptivos

### Nivel 4: UI (Frontend)
- ✅ Menú oculta enlaces de admin para usuarios normales
- ✅ Página de admin redirige usuarios normales
- ✅ Loading state mientras verifica permisos

### Nivel 5: Registro
- ✅ Nuevos usuarios siempre se crean como USER
- ✅ Solo el script `crear-admin` puede crear ADMIN

---

## 🚀 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run crear-admin` | Crear o actualizar usuario administrador |
| `npm run db:studio` | Abrir Prisma Studio para ver/editar roles manualmente |

---

## 📊 Monitoreo de Roles

### Ver Roles en Prisma Studio

```bash
npm run db:studio
```

- Ir a la tabla `User`
- Ver columna `role`
- Filtrar por `role = 'ADMIN'` para ver todos los admins

### Actualizar Rol Manualmente (Solo en desarrollo)

```bash
npx prisma studio
```

1. Abrir tabla `User`
2. Hacer click en el usuario
3. Cambiar campo `role` a `ADMIN` o `USER`
4. Guardar cambios

**⚠️ Precaución:** En producción, usar solo el script `crear-admin`.

---

## 🎉 Estado Actual del Sistema

- ✅ Campo `role` agregado al schema
- ✅ Enum `Role` con USER y ADMIN
- ✅ Migración aplicada a la base de datos
- ✅ Usuario admin creado (`pdmas287@gmail.com`)
- ✅ Tipos TypeScript actualizados
- ✅ Autenticación incluye rol en sesión
- ✅ APIs protegidas con validación de rol
- ✅ Página de admin protegida
- ✅ Menú condicional según rol
- ✅ Registro crea usuarios con rol USER
- ✅ Script para crear administradores
- ✅ Todas las validaciones funcionando

---

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca confíes solo en el frontend:**
   - ✅ Siempre validar permisos en las APIs
   - ✅ Ocultar UI es UX, no seguridad

2. **Validación en múltiples capas:**
   - ✅ Base de datos (esquema)
   - ✅ Backend (APIs)
   - ✅ Frontend (UI/UX)

3. **Principio de menor privilegio:**
   - ✅ Usuarios nuevos = USER por defecto
   - ✅ Solo script específico crea ADMIN

4. **Auditoría:**
   - ✅ Logs en consola para operaciones admin
   - ✅ Prisma Studio para revisar roles

5. **Manejo de errores:**
   - ✅ 401 para no autenticados
   - ✅ 403 para sin permisos
   - ✅ Mensajes claros pero seguros

---

## 🛠️ Troubleshooting

### Usuario no puede acceder a panel admin

**Verificar:**
1. ¿El usuario tiene rol ADMIN en la base de datos?
   ```bash
   npm run db:studio
   ```

2. ¿Cerró sesión y volvió a iniciar después del cambio de rol?
   - NextAuth cachea la sesión
   - Debe cerrar sesión y volver a entrar

3. ¿El campo `role` existe en el schema?
   ```bash
   npx prisma db push
   ```

### API devuelve 403 para admin

**Verificar:**
1. ¿La sesión incluye el campo `role`?
   - Revisar callbacks en `auth.ts`
   - Verificar tipos en `types/next-auth.d.ts`

2. ¿El usuario cerró sesión y volvió a entrar?
   - El token JWT se genera al login
   - Cambios de rol requieren nuevo login

### Menú muestra Admin para usuario normal

**Verificar:**
1. ¿El filtro está aplicado en `layout.tsx`?
   ```typescript
   const filteredNavItems = navItems.filter(item => {
     if (item.adminOnly) {
       return session.user?.role === 'ADMIN'
     }
     return true
   })
   ```

2. ¿La sesión se está pasando correctamente?
   - Usar `console.log(session)` para debuggear

---

## 📚 Archivos Modificados

### Archivos Nuevos
- [scripts/crear-admin.ts](scripts/crear-admin.ts) - Script para crear admin
- [SISTEMA_ROLES.md](SISTEMA_ROLES.md) - Esta documentación

### Archivos Modificados
- [prisma/schema.prisma](prisma/schema.prisma) - Agregado campo `role` y enum `Role`
- [types/next-auth.d.ts](types/next-auth.d.ts) - Tipos extendidos con `role`
- [auth.ts](auth.ts) - Callbacks incluyen `role`
- [app/api/partidos/[id]/resultado/route.ts](app/api/partidos/[id]/resultado/route.ts) - Validación de ADMIN
- [app/api/admin/recalcular-puntos/route.ts](app/api/admin/recalcular-puntos/route.ts) - Validación de ADMIN
- [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx) - Protección de página
- [app/dashboard/layout.tsx](app/dashboard/layout.tsx) - Menú condicional
- [app/api/auth/register/route.ts](app/api/auth/register/route.ts) - Rol USER por defecto
- [package.json](package.json) - Script `crear-admin`

---

## 🎯 Próximos Pasos (Opcional)

1. **Auditoría de Acciones:**
   - Crear tabla `AdminLog` para registrar acciones de admin
   - Guardar quién, cuándo y qué actualizó

2. **Más Roles:**
   - Agregar rol `MODERATOR` con permisos limitados
   - Ejemplo: puede ver admin panel pero no recalcular todo

3. **Interfaz de Gestión de Usuarios:**
   - Página para que admin pueda cambiar roles de otros usuarios
   - Listar todos los usuarios y sus roles

4. **Notificaciones:**
   - Enviar email cuando se actualiza un resultado
   - Notificar solo a usuarios con predicciones en ese partido

5. **Rate Limiting:**
   - Limitar intentos de actualización de resultados
   - Prevenir abuso de APIs de admin
