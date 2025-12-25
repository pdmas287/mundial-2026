# 🧪 Guía de Testing - Sistema de Autenticación

## 🚀 Cómo Probar la Autenticación

El servidor de desarrollo debería estar corriendo en: **http://localhost:3000**

Si no está corriendo, ejecuta:
```bash
npm run dev
```

---

## ✅ Tests a Realizar

### 1. Test de Landing Page

**Objetivo:** Verificar que la landing page muestra los botones correctos

**Pasos:**
1. Abre http://localhost:3000
2. Deberías ver:
   - Logo ⚽
   - Título "MUNDIAL 2026"
   - Botón "Iniciar Sesión"
   - Botón "Registrarse"

**Resultado esperado:** ✅ Landing page se muestra correctamente

---

### 2. Test de Registro de Usuario

**Objetivo:** Crear una cuenta nueva

**Pasos:**
1. Click en "Registrarse" desde la landing page
2. Deberías llegar a http://localhost:3000/registro
3. Completa el formulario:
   ```
   Nombre: Tu Nombre Completo
   Email: tunombre@test.com
   Contraseña: test123456
   Confirmar: test123456
   ```
4. Click en "Crear Cuenta"
5. Deberías ser redirigido automáticamente a /dashboard

**Resultado esperado:**
- ✅ Usuario creado exitosamente
- ✅ Auto-login funciona
- ✅ Redirigido a dashboard
- ✅ Se muestra tu nombre en el header

**Si hay error:**
- Email ya existe → Usa otro email
- Contraseña muy corta → Mínimo 6 caracteres
- Campos vacíos → Completa todos los campos

---

### 3. Test de Login con Usuario de Prueba

**Objetivo:** Iniciar sesión con credenciales existentes

**Pasos:**
1. Si estás logueado, haz logout primero
2. Ve a http://localhost:3000/login
3. Usa las credenciales de prueba (están visibles en la página):
   ```
   Email: demo@mundial2026.com
   Password: password123
   ```
4. Click en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Redirigido a /dashboard
- ✅ Header muestra "Usuario Demo"

**Si hay error:**
- Credenciales inválidas → Verifica email y password
- No conecta a BD → Verifica que Supabase esté funcionando

---

### 4. Test de Protección de Rutas

**Objetivo:** Verificar que las rutas protegidas funcionan

**Escenario A - Usuario NO logueado:**

1. Abre navegador en modo incógnito (Ctrl+Shift+N)
2. Intenta acceder directamente a: http://localhost:3000/dashboard
3. **Resultado esperado:** Deberías ser redirigido a /login

**Escenario B - Usuario logueado:**

1. Loguéate normalmente
2. Accede a http://localhost:3000/dashboard
3. **Resultado esperado:** Puedes ver el dashboard

**Resultado esperado:**
- ✅ Rutas protegidas solo accesibles con login
- ✅ Redirección automática funciona

---

### 5. Test de Logout

**Objetivo:** Cerrar sesión correctamente

**Pasos:**
1. Estando logueado en /dashboard
2. Click en el botón "Cerrar Sesión" (esquina superior derecha)
3. Deberías volver a la landing page
4. Intenta acceder a /dashboard nuevamente

**Resultado esperado:**
- ✅ Sesión cerrada exitosamente
- ✅ Redirigido a landing page
- ✅ No puedes acceder a /dashboard sin login

---

### 6. Test de Validaciones

**Objetivo:** Verificar que las validaciones funcionan

**En Registro (/registro):**

1. Intenta registrarte con contraseña corta:
   ```
   Password: 123
   ```
   **Resultado esperado:** Error - "Mínimo 6 caracteres"

2. Intenta registrarte con contraseñas diferentes:
   ```
   Password: test123
   Confirmar: test456
   ```
   **Resultado esperado:** Error - "Las contraseñas no coinciden"

3. Intenta registrarte con email inválido:
   ```
   Email: noesunmail
   ```
   **Resultado esperado:** Error de validación HTML5

4. Intenta registrarte con email ya existente:
   ```
   Email: demo@mundial2026.com
   ```
   **Resultado esperado:** Error - "El email ya está registrado"

**En Login (/login):**

1. Intenta login con credenciales incorrectas:
   ```
   Email: demo@mundial2026.com
   Password: wrongpassword
   ```
   **Resultado esperado:** Error - "Credenciales inválidas"

---

### 7. Test de Redirecciones

**Objetivo:** Verificar que las redirecciones automáticas funcionan

**Caso 1 - Usuario logueado en landing:**
1. Estando logueado
2. Ve a http://localhost:3000/
3. **Resultado esperado:** Redirigido automáticamente a /dashboard

**Caso 2 - Usuario logueado en /login:**
1. Estando logueado
2. Ve a http://localhost:3000/login
3. **Resultado esperado:** Redirigido a /dashboard

**Caso 3 - Usuario logueado en /registro:**
1. Estando logueado
2. Ve a http://localhost:3000/registro
3. **Resultado esperado:** Redirigido a /dashboard

---

### 8. Test de Persistencia de Sesión

**Objetivo:** Verificar que la sesión se mantiene

**Pasos:**
1. Loguéate normalmente
2. Refresca la página (F5)
3. Navega entre páginas
4. Cierra y abre la pestaña del navegador

**Resultado esperado:**
- ✅ Sesión se mantiene al refrescar
- ✅ Sesión se mantiene al navegar
- ✅ Sesión se mantiene al cerrar/abrir pestaña (no el navegador completo)

---

## 🗄️ Verificar en Base de Datos

### Opción 1: Prisma Studio

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en http://localhost:5555

**Verificar:**
1. Ve a la tabla "User"
2. Deberías ver:
   - Usuario "Usuario Demo" (el de prueba)
   - Cualquier usuario que hayas creado
3. Verifica que las contraseñas estén hasheadas (no en texto plano)

### Opción 2: Supabase Dashboard

1. Ve a https://supabase.com
2. Accede a tu proyecto
3. Ve a "Table Editor" → "User"
4. Verifica los mismos datos

---

## 🐛 Problemas Comunes

### 1. Error: "Can't reach database server"

**Solución:**
```bash
# Verifica que DATABASE_URL esté correcta en .env
# Reinicia el servidor
npm run dev
```

### 2. Error: "Module not found: Can't resolve '@/auth'"

**Solución:**
```bash
# Reinstala dependencias
npm install
# Reinicia el servidor
npm run dev
```

### 3. Error: "Invalid credentials" con credenciales correctas

**Solución:**
- Verifica que el usuario exista en la BD
- Usa Prisma Studio para verificar
- Verifica que la contraseña del seed sea "password123"

### 4. Servidor no inicia

**Solución:**
```bash
# Matar procesos de Node
taskkill /F /IM node.exe
# O en Mac/Linux
killall node

# Reiniciar servidor
npm run dev
```

### 5. Error de TypeScript

**Solución:**
```bash
# Reinstalar tipos
npm install --save-dev @types/node @types/react @types/react-dom
# Reiniciar servidor
npm run dev
```

---

## ✅ Checklist Completo

Marca cada test cuando lo completes:

- [ ] Landing page se muestra correctamente
- [ ] Puedo registrar un nuevo usuario
- [ ] El auto-login después de registro funciona
- [ ] Puedo hacer login con usuario demo
- [ ] Las rutas protegidas redirigen a /login
- [ ] El logout funciona correctamente
- [ ] Las validaciones de formularios funcionan
- [ ] Las redirecciones automáticas funcionan
- [ ] La sesión persiste al refrescar
- [ ] Los usuarios se guardan en la base de datos
- [ ] Las contraseñas están hasheadas

---

## 📊 Resumen de URLs

- **Landing:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Registro:** http://localhost:3000/registro
- **Dashboard:** http://localhost:3000/dashboard
- **Prisma Studio:** http://localhost:5555 (después de `npm run db:studio`)

---

## 🎉 Si Todo Funciona

¡Felicidades! El sistema de autenticación está funcionando correctamente.

**Próximos pasos:**
- Desarrollar páginas del dashboard
- Implementar sistema de predicciones
- Crear ranking de usuarios
- Añadir vista de brackets

---

## 📝 Notas Adicionales

### Credenciales de Prueba

```
Email: demo@mundial2026.com
Password: password123
```

### Crear Usuarios Adicionales

Puedes crear más usuarios de prueba desde:
- La página de registro (/registro)
- Prisma Studio
- Directamente en Supabase

### Resetear Base de Datos

Si necesitas empezar de cero:
```bash
npm run db:push  # Recrea tablas
npm run db:seed  # Recarga datos iniciales
```
