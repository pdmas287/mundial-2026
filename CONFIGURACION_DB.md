# 🗄️ Configuración de Base de Datos

## Paso 1: Obtener credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a: **Settings** → **Database** → **Connection string**
3. Copia la URI de conexión (debería verse así):
   ```
   postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Paso 2: Configurar archivo .env

Edita el archivo `.env` en la raíz del proyecto y reemplaza los valores:

```env
# Base de datos (Supabase)
DATABASE_URL="tu-url-de-supabase-aqui"

# NextAuth (Este secreto ya está generado)
NEXTAUTH_SECRET="JOlN8GRaEj4FcMyU8/B6E0G0moqmjapxT9SrkGEFY3U="
NEXTAUTH_URL="http://localhost:3000"
```

## Paso 3: Sincronizar el schema con la base de datos

Una vez configurado el `.env`, ejecuta:

```bash
npm run db:push
```

Este comando creará todas las tablas en tu base de datos según el schema de Prisma.

## Paso 4: Poblar la base de datos con datos iniciales

```bash
npm run db:seed
```

Este comando cargará:
- ✅ 48 equipos del Mundial 2026 (12 grupos)
- ✅ 72 partidos de la fase de grupos
- ✅ 27 jugadores destacados
- ✅ 5 premios individuales
- ✅ 1 usuario de prueba

### Credenciales del usuario de prueba:
- **Email:** demo@mundial2026.com
- **Password:** password123

## Paso 5: Verificar los datos (Opcional)

Puedes abrir Prisma Studio para ver los datos:

```bash
npm run db:studio
```

Esto abrirá una interfaz visual en tu navegador donde podrás ver y editar los datos de la base de datos.

## ⚠️ Notas Importantes

- El archivo `.env` NO debe subirse a Git (ya está en .gitignore)
- Guarda una copia segura de tus credenciales
- Para producción, usa variables de entorno de Vercel

## 🔧 Comandos útiles

```bash
npm run db:push    # Sincronizar schema con la BD
npm run db:seed    # Cargar datos iniciales
npm run db:studio  # Abrir Prisma Studio
```

## 📊 Estructura de datos creada

### Equipos (48)
- 12 grupos de 4 equipos cada uno
- Grupos A-L con equipos de todas las confederaciones

### Partidos de Grupos (72)
- 6 partidos por grupo
- 3 jornadas por grupo
- Fechas desde el 11 de junio de 2026

### Jugadores (27)
- Jugadores destacados de las principales selecciones
- Incluye delanteros, mediocampistas y porteros

### Premios (5)
- Campeón (25 pts)
- Subcampeón (15 pts)
- Balón de Oro (20 pts)
- Bota de Oro (20 pts)
- Guante de Oro (15 pts)

## 🆘 Solución de problemas

### Error: "Can't reach database server"
- Verifica que la DATABASE_URL esté correcta
- Revisa que tu IP esté permitida en Supabase (Settings → Database → Connection pooling)

### Error: "Authentication failed"
- Verifica que la contraseña en la URL sea correcta
- Asegúrate de que no haya espacios en la URL

### Error al ejecutar seed
- Ejecuta primero `npm run db:push` para crear las tablas
- Verifica que las dependencias estén instaladas: `npm install`
