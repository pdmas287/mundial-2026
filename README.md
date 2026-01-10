# 🏆 Mundial 2026 - Predicciones

[![CI](https://github.com/pdmas287/mundial-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/pdmas287/mundial-2026/actions/workflows/ci.yml)

Plataforma web para realizar predicciones del Mundial de Fútbol 2026 y competir con otros usuarios.

## ✨ Estado del Proyecto

- ✅ Proyecto Next.js 14 configurado con App Router
- ✅ Base de datos PostgreSQL con Prisma + Supabase
- ✅ 48 equipos y 72 partidos de grupos cargados
- ✅ Sistema de puntuación con multiplicadores por fase
- ✅ Autenticación completa (NextAuth.js)
- ✅ Dashboard completo con todas las páginas
- ✅ Sistema de predicciones en tiempo real
- ✅ Visualización de brackets interactiva
- ✅ Ranking global y por grupos
- ✅ Sistema de notificaciones en tiempo real
- ✅ **Sistema de clasificación automática FIFA** (Mundial 2026 con 48 equipos)
- ⬜ Testing y deployment (Pendiente)

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
git clone https://github.com/pdmas287/mundial-2026.git
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
│   ├── clasificacion.ts  # Sistema de clasificación FIFA
│   ├── anexo-c.ts        # Anexo C - Asignación de terceros
│   └── utils.ts          # Utilidades generales
├── prisma/               # Configuración de Prisma
│   ├── schema.prisma     # Schema de la base de datos
│   └── seed.ts           # Datos iniciales
├── scripts/              # Scripts de automatización
│   └── asignar-clasificados.ts  # Script de clasificación
├── types/                # Tipos TypeScript
└── public/               # Archivos estáticos
    ├── banderas/         # Banderas de equipos
    └── iconos/           # Iconos
```

## 🎮 Comandos Disponibles

```bash
npm run dev                    # Inicia el servidor de desarrollo
npm run build                  # Construye la aplicación para producción
npm run start                  # Inicia el servidor de producción
npm run lint                   # Ejecuta el linter
npm run db:push                # Sincroniza el schema con la BD
npm run db:seed                # Carga datos iniciales
npm run db:studio              # Abre Prisma Studio
npm run asignar-clasificados   # Asigna equipos clasificados a eliminatorias
```

## 🎯 Sistema de Puntuación

### Partidos
- **Resultado exacto:** 5 puntos
- **Goles de un equipo:** 2 puntos
- **Ganador/Empate:** 1 punto

### Multiplicadores por Fase

- Fase de Grupos: x1 (5 puntos máx.)
- **Dieciseisavos: x1.25 (6 puntos máx.)**
- Octavos: x1.5 (7 puntos máx.)
- Cuartos: x2 (10 puntos máx.)
- Semifinales: x2.5 (12 puntos máx.)
- Tercer Puesto: x2 (10 puntos máx.)
- Final: x3 (15 puntos máx.)

### Premios Individuales

- Campeón: 25 puntos
- Subcampeón: 15 puntos
- Balón de Oro: 20 puntos
- Bota de Oro: 20 puntos
- Guante de Oro: 15 puntos

---

## 🏆 Sistema de Clasificación Automática (Mundial 2026)

### Estructura del Torneo

El Mundial 2026 es el primero con **48 equipos**:

- **12 grupos** (A-L) de 4 equipos cada uno
- **32 equipos clasifican**: 12 primeros + 12 segundos + 8 mejores terceros
- **Fases**: GRUPOS → DIECISEISAVOS → OCTAVOS → CUARTOS → SEMIFINALES → FINAL

### Reglas de Clasificación FIFA

El sistema implementa las reglas oficiales de FIFA:

**Artículo 12 - Desempate dentro de grupos:**

1. Mayor número de puntos
2. Mejor diferencia de goles
3. Mayor número de goles a favor
4. Head-to-head (enfrentamientos directos)
5. Puntos Fair Play
6. Ranking FIFA

**Artículo 13 - Mejores terceros lugares:**

Se seleccionan los 8 mejores terceros de los 12 grupos aplicando los mismos criterios.

**Anexo C - Asignación de terceros:**

Los 8 mejores terceros se asignan a partidos específicos según qué grupos tienen terceros clasificados (495 combinaciones posibles).

### Uso del Sistema

Cuando la fase de grupos esté completa, ejecuta:

```bash
npm run asignar-clasificados
```

Este comando automáticamente:

1. ✅ Verifica que todos los partidos de grupos estén finalizados
2. ✅ Calcula posiciones de cada grupo con reglas de desempate
3. ✅ Selecciona los 8 mejores terceros lugares
4. ✅ Asigna los 32 equipos a los 16 partidos de dieciseisavos
5. ✅ Aplica el Anexo C para emparejamientos de terceros

### Archivos del Sistema

- [`lib/clasificacion.ts`](lib/clasificacion.ts) - Cálculo de posiciones y reglas FIFA
- [`lib/anexo-c.ts`](lib/anexo-c.ts) - Implementación del Anexo C
- [`scripts/asignar-clasificados.ts`](scripts/asignar-clasificados.ts) - Script de ejecución
- [`CLASIFICACION_MUNDIAL_2026.md`](CLASIFICACION_MUNDIAL_2026.md) - Documentación completa

---

## 📝 Próximos Pasos

- [x] Implementar autenticación con NextAuth
- [x] Crear páginas del dashboard
- [x] Implementar sistema de predicciones
- [x] Crear visualización de brackets
- [x] Implementar ranking en tiempo real
- [x] Implementar sistema de notificaciones
- [x] Implementar clasificación automática FIFA
- [ ] Testing exhaustivo
- [ ] Agregar datos reales del Mundial 2026
- [ ] Deploy en Vercel

## 📄 Licencia

MIT
