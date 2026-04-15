# ✈️ Plataforma Aeroportuaria Inteligente — La Aurora GUA

Sistema de gestión aeroportuaria de nivel empresarial con Machine Learning, RBAC completo y UX premium.

## 🏗️ Arquitectura

```
aeropuerto_v3/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Tab navigation
│   │   ├── dashboard.tsx       # Dashboard dinámico por rol
│   │   ├── index.tsx           # Tablero de vuelos
│   │   ├── operaciones.tsx     # Módulos operativos (RBAC)
│   │   ├── servicios.tsx       # Servicios y comercial
│   │   ├── sistemas.tsx        # Sistemas y monitoreo
│   │   ├── perfil.tsx          # Login + perfil usuario
│   │   └── admin.tsx           # Panel administrativo
│   ├── reservar/               # Flujo de reservas (5 pasos)
│   ├── modules/                # 29 módulos operativos
│   ├── analytics.tsx           # Dashboard ML/Analytics (Admin)
│   ├── lealtad.tsx             # Programa de lealtad
│   ├── historial.tsx           # Historial de viajes
│   ├── cancelacion.tsx         # Cancelaciones inteligentes
│   └── notificaciones.tsx      # Centro de notificaciones
│
├── src/
│   ├── core/
│   │   ├── domain/entities/    # TypeScript types — 240 tablas Oracle
│   │   ├── infrastructure/api/ # HTTP client + Oracle error handling
│   │   └── shared/
│   │       ├── constants/      # RBAC, roles, permisos
│   │       ├── hooks/          # useBookingFlow, useFlightStatus
│   │       └── utils/          # Dynamic pricing, loyalty points
│   └── modules/
│       ├── ml/engine.ts        # ML: CBF + Collaborative + Context-Aware
│       ├── recommendations/    # Recommendation engine
│       └── notifications/      # Notification store + factory
│
├── context/session.tsx         # Auth + RBAC context (sessionKey pattern)
├── hooks/
│   ├── useAnalytics.ts         # ML feature engineering + recommendations
│   ├── useNotifications.ts     # Notification subscriptions
│   ├── useVuelos.ts            # Flight search + real-time status
│   └── useReservas.ts          # Booking flow state machine
│
├── services/api.ts             # HTTP client with JWT injection
├── services/mockData.ts        # 81 mock data exports (demo mode)
├── constants/theme.ts          # Premium dark design system
└── backend/                    # Node.js + Express + OracleDB
    ├── src/
    │   ├── server.js           # Express entry point
    │   ├── db.js               # Oracle connection pool
    │   ├── routes/
    │   │   ├── auth.js         # POST /login, JWT generation
    │   │   ├── vuelos.js       # GET /vuelos, GET /:id/disponibilidad
    │   │   └── reservas.js     # POST /reservas, PUT /cancelar
    │   └── middleware/auth.js  # JWT verification + RBAC
    └── .env.example
```

## 🔐 Cuentas de demo (contraseña: 1234)

| Usuario       | Rol                 | Acceso                                          |
|---------------|---------------------|-------------------------------------------------|
| cliente       | CLIENTE             | Vuelos públicos, reservar, historial, lealtad   |
| recepcion     | RECEPCIONISTA       | Módulos 1,3,7,8,9,12,13,14                     |
| checkin       | CHECKIN             | Módulos 7,8,9,12                               |
| operaciones   | OPERACIONES         | Módulos 1,3,5,7,8,9,12,13,14                  |
| seguridad     | SEGURIDAD           | Módulos 10,11,12,18,28                         |
| supervisor    | SUPERVISOR          | Módulos 1,3,7-14,18                            |
| jefe          | JEFE_OPERACIONES    | Módulos 1-14,18,21,27,28                       |
| finanzas      | FINANZAS            | Módulos 13,15,16,19,22,26                      |
| rrhh          | RRHH                | Módulos 6,15                                   |
| mantenimiento | MANTENIMIENTO       | Módulos 2,20,22                                |
| admin         | ADMIN               | Todo + Analytics + Gestión usuarios            |

## 🤖 Machine Learning Pipeline

```
Datos entrada:
  reservas (historial) → featureEngineer() → UserFeatureVector
  eventos sesión        ↗                    ↘
  programa_lealtad      →                   fusedRecommend()
                                             ├── contentBasedFilter()   60% weight
                                             ├── collaborativeFilter()  40% weight
                                             └── contextAwareRecommend()

Output: FusedRecommendations {
  vuelos:             Top 5 flights ranked by CBF+CF score
  destinosSugeridos:  Cluster-based new destinations
  serviciosCrossSell: ['upgrade','vip_lounge','loyalty']
  userInsights: {
    score:           0-100 composite user score
    cluster:         HIGH_VALUE | VIP | REGULAR | NEW | CHURNING
    churnRisk:       HIGH | MEDIUM | LOW
    purchaseReady:   true/false (P > 0.5)
    upgradeCandidate:true/false (score > 0.6)
  }
}
```

## 🚀 Inicio rápido

### Frontend
```bash
cd aeropuerto_v3
npm install
npx expo start
```

### Backend (requiere Oracle 19c+)
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales Oracle
node src/server.js
```

### Conectar frontend al backend
```bash
# En aeropuerto_v3/, crear .env:
echo "EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env
```

## 📊 Analytics Dashboard (Admin)
Acceso: login como `admin` → Dashboard → Botón "Analytics"

Incluye:
- Gráfica de líneas: ingresos diarios (7D / 30D / 90D)
- Gráfica de barras: destinos más vendidos
- Donut chart: tipos de usuario y clusters ML
- Funnel de conversión: Búsqueda → Click → Pago → Confirmación
- Tabla de insights ML: churn risk, purchase probability, lift scores

## 🔔 Sistema de Notificaciones
- In-app notification center (`/notificaciones`)
- Tipos: vuelo retrasado/cancelado, check-in disponible, puntos ganados, promo exclusiva, upgrade disponible
- Badge counter en tab de perfil
- Mark as read / delete individual / mark all read

## ❌ Cancelaciones Inteligentes
`/cancelacion?idReserva=N`
1. Detecta motivo de la cancelación (tabla `cancelaciones_vuelo`)
2. Muestra vuelos alternativos filtrados por mismo destino + PROGRAMADO + plazas > 0
3. Ofrece hoteles cercanos con precios y categoría
4. Calcula reembolso con penalización real (0%/10%/25%/50% según días de anticipación)
