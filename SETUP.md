# 🚀 Guía de Instalación Completa — Sistema Aeroportuario La Aurora

## Arquitectura de 3 backends

```
┌─────────────────────────────────────────────────────────────────────┐
│  aeropuerto_v3 (React + Expo)  ──  http://localhost:8081 (Expo)    │
│                                                                     │
│  ↕ :5087  aeropuerto_be-develop   (Módulos 1-4, 6, 21-29)         │
│  ↕ :5088  aeropuerto_be-Gerson    (Módulos 7-14)                   │
│  ↕ :5089  aeropuerto_be-15-20     (Módulos 15-20)                  │
│                                                                     │
│  ↕ :1521  Oracle 21c · SID: ORCL · User: aurora_user               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PASO 1 — Oracle 21c: Crear usuario

Abrir **SQL Developer** con la conexión **BASEHR**:
- Host: localhost | Puerto: 1521 | SID: ORCL
- Usuario: SYS | Contraseña: oracle | Rol: SYSDBA

Ejecutar el script **`scripts/01_crear_usuario.sql`** (como SYS/SYSDBA):

```sql
-- Crea el usuario aurora_user con todos los permisos
-- @scripts/01_crear_usuario.sql
```

---

## PASO 2 — Oracle: Desplegar el schema (240 tablas)

**Nueva conexión en SQL Developer:**
- Host: localhost | Puerto: 1521 | SID: ORCL
- **Usuario: AURORA_USER** | **Contraseña: aurora_pass2024** | Rol: Por defecto

Conectado como `aurora_user`, ejecutar **`incrementos.sql`**:
```sql
-- En SQL Developer: Archivo → Abrir → incrementos.sql → F5 (Run Script)
-- En SQL*Plus:
-- sqlplus aurora_user/aurora_pass2024@localhost:1521/ORCL
-- @incrementos.sql
```

Verifica que se crearon las 240 tablas:
```sql
SELECT COUNT(*) FROM user_tables;
-- Debe retornar: 240
```

---

## PASO 3 — Oracle: Cargar datos de prueba

Conectado como `aurora_user`, ejecutar **`scripts/03_seed_data.sql`**:
```sql
-- @scripts/03_seed_data.sql
```

---

## PASO 4 — Configurar los 3 backends .NET

Copiar el `appsettings.json` actualizado a cada backend:

```bash
# El archivo scripts/appsettings.json ya tiene la cadena correcta:
# aurora_user/aurora_pass2024 @ localhost:1521/ORCL

copy scripts\appsettings.json aeropuerto_be-develop\appsettings.json
copy scripts\appsettings.json aeropuerto_be-Gerson\appsettings.json
copy scripts\appsettings.json aeropuerto_be-modulos-primer-avance-15-20\appsettings.json
```

> ⚠️ El backend Gerson y Modulos usan puertos distintos. Editar
> `Properties/launchSettings.json` en cada uno para asignar el puerto correcto.

### launchSettings.json — Backend Gerson (:5088)
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5088",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  }
}
```

### launchSettings.json — Backend Modulos (:5089)
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5089",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  }
}
```

### Registrar servicios faltantes (Gerson Program.cs)
El backend Gerson solo tiene `AeropuertoService` registrado. Agregar en `Program.cs`:

```csharp
// Módulo 7-8: Pasajeros y Reservas
builder.Services.AddScoped<IPasajeroService, PasajeroService>();
builder.Services.AddScoped<IReservasService, ReservasService>();
builder.Services.AddScoped<IReservasPagosService, ReservasPagosService>();
builder.Services.AddScoped<IHistorialReservasService, HistorialReservasService>();

// Módulo 9: Check-in
builder.Services.AddScoped<ICheckinDigitalService, CheckinDigitalService>();
builder.Services.AddScoped<IPasesAbordajeService, PasesAbordajeService>();
builder.Services.AddScoped<IControlAbordajeService, ControlAbordajeService>();
builder.Services.AddScoped<IGruposEmbarqueService, GruposEmbarqueService>();

// Módulo 10-11: Seguridad
builder.Services.AddScoped<IIncidentesService, IncidentesService>();
builder.Services.AddScoped<IAlertasSeguridadService, AlertasSeguridadService>();
builder.Services.AddScoped<ISeguridadControlesService, SeguridadControlesService>();
builder.Services.AddScoped<IVisitasSeguridadService, VisitasSeguridadService>();
builder.Services.AddScoped<IAccesosAreasRestringidasService, AccesosAreasRestringidasService>();

// Módulo 12: Objetos Perdidos
builder.Services.AddScoped<IObjetosPerdidosService, ObjetosPerdidosService>();
builder.Services.AddScoped<IObjetosDecomisadosService, ObjetosDecomisadosService>();
builder.Services.AddScoped<IObjetosEntregadosService, ObjetosEntregadosService>();
builder.Services.AddScoped<ICategoriasObjetosService, CategoriasObjetosService>();

// Módulo 13: Comercial
builder.Services.AddScoped<IConcesionesComercialesService, ConcesionesComercialesService>();
builder.Services.AddScoped<ITiendasProductosService, TiendasProductosService>();
builder.Services.AddScoped<ITiendasVentasService, TiendasVentasService>();
builder.Services.AddScoped<IRestaurantesMenusService, RestaurantesMenusService>();
builder.Services.AddScoped<ISalonesVipService, SalonesVipService>();
builder.Services.AddScoped<ISalonesAccesosService, SalonesAccesosService>();
builder.Services.AddScoped<IEstacionamientoService, EstacionamientoService>();
builder.Services.AddScoped<IEstacionamientoRegistroService, EstacionamientoRegistroService>();
builder.Services.AddScoped<IPublicidadService, PublicidadService>();
builder.Services.AddScoped<IPromocionesService, PromocionesService>();

// Módulo 14: Servicios al pasajero
builder.Services.AddScoped<ISolicitudesEspecialesService, SolicitudesEspecialesService>();
builder.Services.AddScoped<IAtencionEspecialService, AtencionEspecialService>();
builder.Services.AddScoped<IEquipajeEspecialService, EquipajeEspecialService>();
builder.Services.AddScoped<IEmergenciasMedicasService, EmergenciasMedicasService>();
builder.Services.AddScoped<IEncuestasSatisfaccionService, EncuestasSatisfaccionService>();
builder.Services.AddScoped<IQuejasSugerenciasService, QuejasSugerenciasService>();
builder.Services.AddScoped<ITransporteTerrestreService, TransporteTerrestreService>();
builder.Services.AddScoped<IHotelesCercanosService, HotelesCercanosService>();
builder.Services.AddScoped<IProgramaLealtadService, ProgramaLealtadService>();

// Pasajeros adicionales
builder.Services.AddScoped<IPasajeroPreferencia, PasajeroPreferenciaService>();
builder.Services.AddScoped<IPasajerosDocumentosService, PasajerosDocumentosService>();
builder.Services.AddScoped<IPerfilViajeroService, PerfilViajeroService>();
builder.Services.AddScoped<IGruposViajeService, GruposViajeService>();
builder.Services.AddScoped<IGruposPasajerosService, GruposPasajerosService>();
```

### CORS — Agregar puertos de Expo a todos los backends
En cada `Program.cs`, actualizar CORS:
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "http://localhost:8081",  // Expo web
    "http://localhost:19006"  // Expo Go
)
.AllowAnyMethod()
.AllowAnyHeader();
```

---

## PASO 5 — Levantar los 3 backends

Abrir 3 terminales:

```bash
# Terminal 1 — Backend develop (:5087)
cd aeropuerto_be-develop
dotnet run --launch-profile http

# Terminal 2 — Backend Gerson (:5088)
cd aeropuerto_be-Gerson
dotnet run --launch-profile http

# Terminal 3 — Backend Módulos 15-20 (:5089)
cd aeropuerto_be-modulos-primer-avance-15-20
dotnet run --launch-profile http
```

Verificar que los 3 responden:
```bash
curl http://localhost:5087/api/test
curl http://localhost:5088/api/test
curl http://localhost:5089/api/test
# Todos deben retornar: {"status":"Backend funcionando","database":"Oracle Ready"}
```

Swagger de cada uno:
- http://localhost:5087/swagger (develop)
- http://localhost:5088/swagger (Gerson)
- http://localhost:5089/swagger (Módulos 15-20)

---

## PASO 6 — Levantar el frontend

```bash
cd aeropuerto_v3
cp .env.example .env        # ya tiene los 3 puertos configurados
npm install
npx expo start --clear
```

La app muestra **3 indicadores** en el perfil y dashboard:
- 🟢 Core — backend develop
- 🟢 Client — backend Gerson
- 🟢 Ops — backend Módulos

---

## Cambiar conexión Oracle

Todo está en `scripts/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "OracleDb": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)));User Id=aurora_user;Password=aurora_pass2024;"
  }
}
```

| Campo     | Tu valor actual | Cambiar si...                    |
|-----------|-----------------|----------------------------------|
| HOST      | localhost       | Oracle en otro servidor          |
| PORT      | 1521            | Puerto diferente del listener    |
| SID       | ORCL            | Tu SID es diferente              |
| User Id   | aurora_user     | Usas otro usuario                |
| Password  | aurora_pass2024 | Cambias la contraseña            |

---

## Cuentas de prueba (contraseña: 1234)

| Usuario      | Rol               | Acceso                         |
|--------------|-------------------|--------------------------------|
| cliente      | CLIENTE           | App completa + reservas        |
| admin        | ADMIN             | Dashboard ejecutivo            |
| operaciones  | OPERACIONES       | Módulos de vuelos              |
| checkin      | CHECKIN           | Check-in y embarque            |
| finanzas     | FINANZAS          | Módulos financieros            |
| seguridad    | SEGURIDAD         | Incidentes y alertas           |
| rrhh         | RRHH              | Empleados y nómina             |
| mantenimiento| MANTENIMIENTO     | Módulo 20                      |

---

## Endpoints por backend

### Backend DEVELOP (:5087) — 85 controllers
`/api/aeropuertos` · `/api/aerolineas` · `/api/tripulacion`
`/api/temporadavuelo` · `/api/modeloavion` · `/api/fabricanteavion`
`/api/diasoperacion` · `/api/tipoaerolinea` · `/api/rolsistema`
`/api/usuariosistema` · (+ 75 módulos 21-29)

### Backend GERSON (:5088) — 62 controllers
`/api/pasajeros` · `/api/reservas` · `/api/reservaspagos`
`/api/checkindigital` · `/api/pasesabordaje` · `/api/grupoembarque`
`/api/programalealtad` · `/api/hotelescercanos` · `/api/incidentes`
`/api/alertasseguridad` · `/api/objetosperdidos` · `/api/salonesvip`
`/api/tiendasproductos` · `/api/promociones` · (+ más)

### Backend MÓDULOS (:5089) — 37 controllers, todos registrados
`/api/empleado` · `/api/departamento` · `/api/puesto`
`/api/asistencia` · `/api/vacaciones` · `/api/evaluacion`
`/api/ingreso` · `/api/gasto` · `/api/presupuesto`
`/api/enviocarga` · `/api/manifiestocarga` · `/api/seguimientocarga`
`/api/ordenmantenimientopredictivo` · `/api/piezareemplazo`
`/api/pasajeromenor` · `/api/autorizacionmenor` · `/api/pasajeromascota`
