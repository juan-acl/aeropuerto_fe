# ✈️ Aeropuerto La Aurora – Frontend Completo (Expo React Native)

Sistema de gestión aeroportuaria completo con **29 módulos**, **240 tablas** y pantallas funcionales para web, Android e iOS.

---

## 🚀 Instalación y Arranque

```bash
# 1. Descomprimí el ZIP
unzip aeropuerto_full.zip
cd aeropuerto_full

# 2. Instalá dependencias
npm install

# 3. Iniciá Expo
npx expo start
```

### Plataformas disponibles

| Plataforma  | Comando en terminal |
|-------------|---------------------|
| **Web**     | Presioná `W` → abre en `http://localhost:8081` |
| **Android** | Presioná `A` (necesitás Android emulator o Expo Go) |
| **iOS**     | Presioná `I` (solo en macOS con Xcode) |
| **Móvil**   | Escaneá el QR con la app **Expo Go** |

**Login Admin:** usuario `admin`, contraseña `1234`

---

## 📱 Estructura de Navegación

```
Bottom Tabs (5 pestañas):
├── ✈️  Vuelos          → Panel de vuelos en tiempo real
├── 📊  Operaciones    → Módulos 1–9 (Catálogos y Operaciones)
├── ⭐  Servicios      → Módulos 10–20 (Seguridad, Comercial, RRHH)
├── ⚙️  Sistemas       → Módulos 21–29 (Monitoreo y Cumplimiento)
└── 👤  Admin          → Dashboard ejecutivo + Login
```

---

## 🗂️ Los 29 Módulos Implementados

| Módulo | Nombre | Ruta |
|--------|--------|------|
| 1  | Infraestructura Aeroportuaria | `/modules/mod01-infraestructura` |
| 2  | Flota Aérea                  | `/modules/mod02-flota` |
| 3  | Aerolíneas y Operaciones      | `/modules/mod03-aerolineas` |
| 4  | Programación de Vuelos        | `/modules/mod04-programacion` |
| 5  | Operaciones de Vuelo          | `/modules/mod05-operaciones` |
| 6  | Tripulación                   | `/modules/mod06-tripulacion` |
| 7  | Pasajeros                     | `/modules/mod07-pasajeros` |
| 8  | Reservas y Boletería          | `/modules/mod08-reservas` |
| 9  | Check-in y Abordaje           | `/modules/mod09-checkin` |
| 10 | Seguridad                     | `/modules/mod10-seguridad` |
| 11 | Seguridad Aeroportuaria       | `/modules/mod11-seg-aeroportuaria` |
| 12 | Objetos Perdidos              | `/modules/mod12-objetos-perdidos` |
| 13 | Área Comercial                | `/modules/mod13-comercial` |
| 14 | Servicios al Pasajero         | `/modules/mod14-servicios` |
| 15 | Recursos Humanos              | `/modules/mod15-rrhh` |
| 16 | Finanzas y Contabilidad       | `/modules/mod16-finanzas` |
| 18 | Menores y Grupos Especiales   | `/modules/mod18-especiales` |
| 19 | Carga y Mercancías            | `/modules/mod19-carga` |
| 20 | Mantenimiento Predictivo      | `/modules/mod20-mantenimiento` |
| 21 | Operaciones Tiempo Real       | `/modules/mod21-tiempo-real` |
| 22 | Gestión de Combustible        | `/modules/mod22-combustible` |
| 23 | Gestión Ambiental             | `/modules/mod23-ambiental` |
| 24 | Seguridad Informática         | `/modules/mod24-seguridad-info` |
| 25 | Marketing y Fidelización      | `/modules/mod25-marketing` |
| 26 | Gestión Documental            | `/modules/mod26-documental` |
| 27 | Transporte Terrestre          | `/modules/mod27-transporte` |
| 28 | Gestión de Emergencias        | `/modules/mod28-emergencias` |
| 29 | Interoperabilidad OACI        | `/modules/mod29-oaci` |

---

## 🔌 Conectar con el Backend Oracle

Los datos vienen de `services/mockData.ts`. Para conectar con tu API REST:

```typescript
// En cualquier pantalla, reemplazá el useState inicial
const [data, setData] = useState([]);

useEffect(() => {
  fetch('http://TU_BACKEND:PORT/api/endpoint')
    .then(r => r.json())
    .then(setData)
    .catch(console.error);
}, []);
```

Los stored procedures del backend mapean directamente con los tipos en `types/index.ts`.

---

## 📁 Estructura del Proyecto

```
aeropuerto_full/
├── app/
│   ├── _layout.tsx              # Root layout
│   ├── (tabs)/                  # Bottom navigation
│   │   ├── _layout.tsx          # Tab configuración
│   │   ├── index.tsx            # ✈️ Panel de Vuelos
│   │   ├── operaciones.tsx      # 📊 Hub Módulos 1-9
│   │   ├── servicios.tsx        # ⭐ Hub Módulos 10-20
│   │   ├── sistemas.tsx         # ⚙️ Hub Módulos 21-29
│   │   └── admin.tsx            # 👤 Dashboard Admin
│   └── modules/                 # Pantallas individuales
│       ├── _layout.tsx
│       ├── vuelo-detalle.tsx    # Detalle de vuelo
│       ├── mod01-infraestructura.tsx
│       ├── mod02-flota.tsx
│       └── ... (29 módulos)
├── components/
│   ├── FlightCard.tsx           # Tarjeta de vuelo
│   ├── haptic-tab.tsx
│   ├── ui/icon-symbol.tsx
│   └── shared/index.tsx         # Badge, DataCard, FormModal, FF, StatCard...
├── constants/theme.ts           # Paleta de colores
├── services/mockData.ts         # Datos de prueba (todos los módulos)
├── types/index.ts               # Tipos TypeScript (240 tablas)
└── hooks/
```

---

## 🎨 Paleta de Colores

```
Navy:    #003366   Fondo:    #F0F4F8
Éxito:   #27AE60   Error:    #E74C3C
Alerta:  #F39C12   Info:     #2980B9
```
