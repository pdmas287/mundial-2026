# 🏆 Mundial 2026 - Predicciones
## Arquitectura del Proyecto

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Next.js | 14+ (App Router) |
| Lenguaje | TypeScript | 5+ |
| Estilos | Tailwind CSS | 3+ |
| Base de Datos | PostgreSQL | 15+ |
| ORM | Prisma | 5+ |
| Autenticación | NextAuth.js | 5+ |
| Hosting | Vercel + Supabase | - |

---

## Estructura de Carpetas

```
mundial-2026/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── calendario/
│   │   │   └── page.tsx
│   │   ├── predicciones/
│   │   │   └── page.tsx
│   │   ├── brackets/
│   │   │   └── page.tsx
│   │   ├── ranking/
│   │   │   └── page.tsx
│   │   ├── premios/
│   │   │   └── page.tsx
│   │   └── perfil/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── partidos/
│   │   │   └── route.ts
│   │   ├── predicciones/
│   │   │   └── route.ts
│   │   └── ranking/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── partidos/
│   │   ├── PartidoCard.tsx
│   │   ├── CalendarioGrupos.tsx
│   │   └── PrediccionForm.tsx
│   ├── brackets/
│   │   ├── BracketView.tsx
│   │   ├── MatchNode.tsx
│   │   └── RoundColumn.tsx
│   ├── ranking/
│   │   ├── TablaGlobal.tsx
│   │   └── PosicionUsuario.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── puntuacion.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── public/
│   ├── banderas/
│   └── iconos/
├── .env
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Esquema de Base de Datos (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ USUARIOS ============
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  nombre        String
  password      String
  avatar        String?
  puntosTotal   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  predicciones        Prediccion[]
  prediccionesPremios PrediccionPremio[]
}

// ============ EQUIPOS ============
model Equipo {
  id          String   @id @default(cuid())
  nombre      String   @unique
  codigo      String   @unique  // Ej: "ARG", "BRA", "MEX"
  bandera     String              // URL de la bandera
  grupo       String              // Ej: "A", "B", "C"...
  
  partidosLocal     Partido[] @relation("EquipoLocal")
  partidosVisitante Partido[] @relation("EquipoVisitante")
}

// ============ PARTIDOS ============
model Partido {
  id              String   @id @default(cuid())
  fase            Fase
  grupo           String?            // Solo para fase de grupos
  ronda           Ronda?             // Para eliminatorias
  fecha           DateTime
  sede            String
  estadio         String
  
  equipoLocalId     String
  equipoVisitanteId String
  equipoLocal       Equipo   @relation("EquipoLocal", fields: [equipoLocalId], references: [id])
  equipoVisitante   Equipo   @relation("EquipoVisitante", fields: [equipoVisitanteId], references: [id])
  
  golesLocal        Int?     // null = partido no jugado
  golesVisitante    Int?
  penalesLocal      Int?     // Para eliminatorias
  penalesVisitante  Int?
  
  estado          EstadoPartido @default(PENDIENTE)
  
  predicciones    Prediccion[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Fase {
  GRUPOS
  OCTAVOS
  CUARTOS
  SEMIFINAL
  TERCER_PUESTO
  FINAL
}

enum Ronda {
  OCTAVOS_1
  OCTAVOS_2
  OCTAVOS_3
  OCTAVOS_4
  OCTAVOS_5
  OCTAVOS_6
  OCTAVOS_7
  OCTAVOS_8
  CUARTOS_1
  CUARTOS_2
  CUARTOS_3
  CUARTOS_4
  SEMIFINAL_1
  SEMIFINAL_2
  TERCER_PUESTO
  FINAL
}

enum EstadoPartido {
  PENDIENTE
  EN_CURSO
  FINALIZADO
  SUSPENDIDO
}

// ============ PREDICCIONES ============
model Prediccion {
  id              String   @id @default(cuid())
  
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  partidoId       String
  partido         Partido  @relation(fields: [partidoId], references: [id])
  
  golesLocal      Int
  golesVisitante  Int
  
  puntosObtenidos Int?     // null = no calculado aún
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId, partidoId])  // Un usuario solo puede predecir una vez por partido
}

// ============ PREMIOS INDIVIDUALES ============
model Premio {
  id          String      @id @default(cuid())
  tipo        TipoPremio  @unique
  nombre      String
  descripcion String
  puntos      Int         // Puntos por acertar
  
  predicciones PrediccionPremio[]
}

enum TipoPremio {
  BALON_ORO       // Mejor jugador
  BOTA_ORO        // Máximo goleador
  GUANTE_ORO      // Mejor portero
  CAMPEON         // Equipo campeón
  SUBCAMPEON      // Equipo subcampeón
}

model Jugador {
  id          String   @id @default(cuid())
  nombre      String
  posicion    String
  equipoId    String
  foto        String?
  
  predicciones PrediccionPremio[]
}

model PrediccionPremio {
  id          String   @id @default(cuid())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  premioId    String
  premio      Premio   @relation(fields: [premioId], references: [id])
  
  // Para premios de jugador
  jugadorId   String?
  jugador     Jugador? @relation(fields: [jugadorId], references: [id])
  
  // Para premios de equipo (Campeón, Subcampeón)
  equipoId    String?
  
  acertado    Boolean?  // null = no definido aún
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([userId, premioId])
}
```

---

## Sistema de Puntuación

### Partidos

| Acierto | Puntos | Descripción |
|---------|--------|-------------|
| Resultado exacto | **5 pts** | Acertar el marcador completo (ej: 2-1) |
| Goles de un equipo | **2 pts** | Acertar goles de local O visitante |
| Ganador/Empate | **1 pt** | Acertar quién gana o si empatan |
| Fallo total | **0 pts** | No acertar nada |

**Nota:** Los puntos NO son acumulativos. Se otorga el mayor acierto.

### Multiplicadores por Fase

| Fase | Multiplicador |
|------|---------------|
| Fase de Grupos | x1 |
| Octavos de Final | x1.5 |
| Cuartos de Final | x2 |
| Semifinales | x2.5 |
| Tercer Puesto | x2 |
| Final | x3 |

### Premios Individuales

| Premio | Puntos |
|--------|--------|
| Campeón del Mundial | **25 pts** |
| Subcampeón | **15 pts** |
| Balón de Oro | **20 pts** |
| Bota de Oro | **20 pts** |
| Guante de Oro | **15 pts** |

---

## Lógica de Puntuación (TypeScript)

```typescript
// lib/puntuacion.ts

import { Fase } from '@prisma/client';

interface ResultadoReal {
  golesLocal: number;
  golesVisitante: number;
}

interface Prediccion {
  golesLocal: number;
  golesVisitante: number;
}

const MULTIPLICADORES: Record<Fase, number> = {
  GRUPOS: 1,
  OCTAVOS: 1.5,
  CUARTOS: 2,
  SEMIFINAL: 2.5,
  TERCER_PUESTO: 2,
  FINAL: 3,
};

export function calcularPuntos(
  prediccion: Prediccion,
  resultado: ResultadoReal,
  fase: Fase
): number {
  const multiplicador = MULTIPLICADORES[fase];
  
  // Resultado exacto: 5 puntos
  if (
    prediccion.golesLocal === resultado.golesLocal &&
    prediccion.golesVisitante === resultado.golesVisitante
  ) {
    return Math.round(5 * multiplicador);
  }
  
  // Acierto parcial: goles de un equipo
  const aciertoLocal = prediccion.golesLocal === resultado.golesLocal;
  const aciertoVisitante = prediccion.golesVisitante === resultado.golesVisitante;
  
  if (aciertoLocal || aciertoVisitante) {
    return Math.round(2 * multiplicador);
  }
  
  // Acierto del ganador o empate
  const ganadorReal = determinarGanador(resultado);
  const ganadorPredicho = determinarGanador(prediccion);
  
  if (ganadorReal === ganadorPredicho) {
    return Math.round(1 * multiplicador);
  }
  
  return 0;
}

type Ganador = 'LOCAL' | 'VISITANTE' | 'EMPATE';

function determinarGanador(resultado: { golesLocal: number; golesVisitante: number }): Ganador {
  if (resultado.golesLocal > resultado.golesVisitante) return 'LOCAL';
  if (resultado.golesLocal < resultado.golesVisitante) return 'VISITANTE';
  return 'EMPATE';
}

// Ejemplo de uso:
// const puntos = calcularPuntos(
//   { golesLocal: 2, golesVisitante: 1 },  // Predicción
//   { golesLocal: 2, golesVisitante: 0 },  // Resultado real
//   'CUARTOS'                               // Fase
// );
// Resultado: 4 puntos (2 pts por acertar goles local × 2 multiplicador)
```

---

## Flujo de Pantallas

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                            │
│                    (Página de bienvenida)                       │
│                                                                 │
│                    [Iniciar Sesión] [Registrarse]               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Calendario│  │Prediccio-│  │ Brackets │  │ Ranking  │        │
│  │          │  │   nes    │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Premios  │  │  Perfil  │                                     │
│  │          │  │          │                                     │
│  └──────────┘  └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Descripción de Pantallas

1. **Calendario**: Vista de todos los partidos por fecha/grupo
2. **Predicciones**: Formulario para ingresar predicciones de cada partido
3. **Brackets**: Visualización de la fase eliminatoria (Octavos → Final)
4. **Ranking**: Tabla de posiciones global con todos los usuarios
5. **Premios**: Predicción de Balón de Oro, Bota de Oro, Guante de Oro, Campeón
6. **Perfil**: Puntos acumulados, posición, historial de predicciones

---

## Comandos para Iniciar el Proyecto

```bash
# 1. Crear proyecto Next.js
npx create-next-app@latest mundial-2026 --typescript --tailwind --eslint --app --src-dir=false

# 2. Instalar dependencias
cd mundial-2026
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install lucide-react           # Iconos
npm install date-fns               # Manejo de fechas
npm install zod                    # Validación
npm install @tanstack/react-query  # Cache y fetching

# 3. Inicializar Prisma
npx prisma init

# 4. Configurar .env
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET="..."
# NEXTAUTH_URL="http://localhost:3000"

# 5. Crear tablas
npx prisma db push

# 6. Ejecutar seed (cargar equipos y partidos)
npx prisma db seed

# 7. Iniciar desarrollo
npm run dev
```

---

## Variables de Entorno (.env)

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: Proveedores OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## Próximos Pasos

1. ✅ Definir arquitectura
2. ⬜ Crear proyecto base
3. ⬜ Configurar base de datos
4. ⬜ Implementar autenticación
5. ⬜ Crear seed con equipos y partidos del Mundial 2026
6. ⬜ Desarrollar componentes de UI
7. ⬜ Implementar lógica de predicciones
8. ⬜ Crear sistema de brackets
9. ⬜ Implementar ranking en tiempo real
10. ⬜ Testing y deployment
