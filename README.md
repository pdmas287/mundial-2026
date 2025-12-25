# 🏆 Mundial 2026 - Predicciones

Plataforma web para realizar predicciones del Mundial de Fútbol 2026 y competir con otros usuarios.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript 5+
- **Estilos:** Tailwind CSS 3+
- **Base de Datos:** PostgreSQL 15+
- **ORM:** Prisma 5+
- **Autenticación:** NextAuth.js 5+

## 📦 Instalación

1. Clona el repositorio
```bash
git clone <tu-repositorio>
cd mundial-2026
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura:
- `DATABASE_URL`: Tu URL de conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Genera uno con `openssl rand -base64 32`
- `NEXTAUTH_URL`: URL de tu aplicación (http://localhost:3000 en desarrollo)

4. Configura la base de datos
```bash
# Sincronizar el schema con la base de datos
npm run db:push

# (Opcional) Cargar datos de prueba
npm run db:seed
```

5. Inicia el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
mundial-2026/
├── app/                    # Páginas y rutas (Next.js App Router)
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── ui/               # Componentes UI básicos
│   ├── partidos/         # Componentes de partidos
│   ├── brackets/         # Componentes de brackets
│   ├── ranking/          # Componentes de ranking
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuraciones
│   ├── prisma.ts         # Cliente de Prisma
│   ├── auth.ts           # Configuración de NextAuth
│   ├── puntuacion.ts     # Lógica de puntuación
│   └── utils.ts          # Utilidades generales
├── prisma/               # Configuración de Prisma
│   ├── schema.prisma     # Schema de la base de datos
│   └── seed.ts           # Datos iniciales
├── types/                # Tipos TypeScript
└── public/               # Archivos estáticos
    ├── banderas/         # Banderas de equipos
    └── iconos/           # Iconos
```

## 🎮 Comandos Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta el linter
npm run db:push      # Sincroniza el schema con la BD
npm run db:seed      # Carga datos iniciales
npm run db:studio    # Abre Prisma Studio
```

## 🎯 Sistema de Puntuación

### Partidos
- **Resultado exacto:** 5 puntos
- **Goles de un equipo:** 2 puntos
- **Ganador/Empate:** 1 punto

### Multiplicadores por Fase
- Fase de Grupos: x1
- Octavos: x1.5
- Cuartos: x2
- Semifinales: x2.5
- Tercer Puesto: x2
- Final: x3

### Premios Individuales
- Campeón: 25 puntos
- Subcampeón: 15 puntos
- Balón de Oro: 20 puntos
- Bota de Oro: 20 puntos
- Guante de Oro: 15 puntos

## 📝 Próximos Pasos

- [ ] Implementar autenticación con NextAuth
- [ ] Crear páginas del dashboard
- [ ] Implementar sistema de predicciones
- [ ] Crear visualización de brackets
- [ ] Implementar ranking en tiempo real
- [ ] Agregar datos reales del Mundial 2026
- [ ] Deploy en Vercel

## 📄 Licencia

MIT
