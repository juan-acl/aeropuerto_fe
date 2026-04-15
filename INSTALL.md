# 🛠️ Guía de Instalación Completa — Aeropuerto La Aurora

## Configuración detectada de tu Oracle 21c
```
Host:     localhost
Puerto:   1521
SID:      ORCL
SYS pass: oracle
```

---

## PASO 1 — Crear usuario Oracle desde SQL Developer

### 1.1 Conectar como SYS (ya lo tienes configurado en BASEHR)

Usa tu conexión existente en SQL Developer con:
- Usuario: `SYS`
- Contraseña: `oracle`
- Rol: `SYSDBA`

### 1.2 Verificar si Oracle es CDB o non-CDB

Ejecuta en SQL Developer (como SYS):
```sql
SELECT CDB, NAME FROM V$DATABASE;
```

**Resultado A — CDB=YES (Multitenant):**
```sql
-- Necesitas trabajar en un PDB. Ver los PDBs disponibles:
SELECT CON_ID, NAME, OPEN_MODE FROM V$PDBS;

-- Abrir el PDB si está cerrado (reemplaza XEPDB1 con tu PDB):
ALTER PLUGGABLE DATABASE XEPDB1 OPEN;

-- Cambiar al PDB para crear el usuario:
ALTER SESSION SET CONTAINER = XEPDB1;
```

**Resultado B — CDB=NO (non-CDB, más común en Oracle 21c XE):**
```sql
-- No necesitas nada extra, continúa con Paso 1.3
```

### 1.3 Crear el usuario aurora_user

```sql
-- Crear usuario (ejecutar en el PDB si es CDB, o directamente si non-CDB)
CREATE USER aurora_user IDENTIFIED BY "Aurora2024#"
    DEFAULT TABLESPACE USERS
    TEMPORARY TABLESPACE TEMP
    QUOTA UNLIMITED ON USERS;

-- Dar todos los permisos necesarios
GRANT CONNECT, RESOURCE TO aurora_user;
GRANT CREATE SESSION TO aurora_user;
GRANT CREATE TABLE TO aurora_user;
GRANT CREATE SEQUENCE TO aurora_user;
GRANT CREATE VIEW TO aurora_user;
GRANT CREATE PROCEDURE TO aurora_user;
GRANT CREATE TRIGGER TO aurora_user;
GRANT CREATE INDEX TO aurora_user;
GRANT UNLIMITED TABLESPACE TO aurora_user;
GRANT SELECT ANY DICTIONARY TO aurora_user;

-- Verificar
SELECT username, account_status FROM dba_users WHERE username = 'AURORA_USER';
```

**Debería mostrar:** `AURORA_USER | OPEN`

---

## PASO 2 — Crear la base de datos (240 tablas)

### 2.1 Conectar como aurora_user en SQL Developer

Crea una nueva conexión en SQL Developer:
```
Name:       AURORA_DB
Username:   aurora_user
Password:   Aurora2024#
Hostname:   localhost
Port:       1521
SID:        ORCL
```

### 2.2 Ejecutar el script de la base de datos

1. Abre SQL Developer con la conexión `AURORA_DB`
2. Menú: **File → Open** → selecciona `incrementos.sql`
3. Click en **Run Script** (F5)
4. Espera a que termine (puede tomar 2-3 minutos, 240 tablas)

### 2.3 Verificar tablas creadas

```sql
-- Debe mostrar: "Total de tablas creadas: 240"
SELECT 'Total tablas: ' || COUNT(*) FROM user_tables;

-- Ver algunas tablas clave:
SELECT table_name FROM user_tables 
WHERE table_name IN ('AEROPUERTOS','AEROLINEAS','VUELOS','RESERVAS','PASAJEROS')
ORDER BY 1;
```

---

## PASO 3 — Configurar el backend .NET

### 3.1 Editar appsettings.json

Abre `aeropuerto_be-develop/appsettings.json` y reemplaza el contenido:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "OracleDb": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)));User Id=aurora_user;Password=Aurora2024#;"
  }
}
```

> **Si tu Oracle es CDB/PDB**, usa el nombre del servicio en lugar de SID:
> ```
> Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))
> (CONNECT_DATA=(SERVICE_NAME=XEPDB1)));User Id=aurora_user;Password=Aurora2024#;
> ```

### 3.2 Registrar todos los servicios en Program.cs

Abre `aeropuerto_be-develop/Program.cs` y agrega **después** de la línea del AeropuertoService:

```csharp
// ── Servicios existentes ──────────────────────────────────────────
builder.Services.AddScoped<IAeropuertoService, AeropuertoService>();

// ── AGREGAR ESTOS SERVICIOS ───────────────────────────────────────
builder.Services.AddScoped<IAerolineaService,       AerolineaService>();
builder.Services.AddScoped<ITripulacionService,     TripulacionService>();
builder.Services.AddScoped<ITemporadaVueloService,  TemporadaVueloService>();
builder.Services.AddScoped<IModeloAvionService,     ModeloAvionService>();
builder.Services.AddScoped<IFabricanteAvionService, FabricanteAvionService>();
builder.Services.AddScoped<IMotorAvionService,      MotorAvionService>();
builder.Services.AddScoped<IUsuarioSistemaService,  UsuarioSistemaService>();
builder.Services.AddScoped<IRolSistemaService,      RolSistemaService>();
builder.Services.AddScoped<IUsuarioRolService,      UsuarioRolService>();
```

### 3.3 Arreglar CORS para Expo

En `Program.cs`, actualiza la política CORS para incluir el puerto de Expo:

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy(name: MiAppReact,
        policy => {
            policy.WithOrigins(
                "http://localhost:3000",   // React web
                "http://localhost:8081",   // Expo web
                "http://localhost:19006",  // Expo web alternativo
                "http://localhost:19000"   // Expo Go
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
        });
});
```

---

## PASO 4 — Levantar el backend

```bash
cd aeropuerto_be-develop

# Verificar que .NET 8 está instalado
dotnet --version   # debe mostrar 8.x.x

# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar (perfil HTTP - puerto 5087)
dotnet run --launch-profile http
```

**Verificar que funciona:**
```bash
# En otra terminal o navegador:
curl http://localhost:5087/api/test
# Respuesta: {"status":"Backend funcionando","database":"Oracle Ready"}

# Ver todos los endpoints:
# Abrir: http://localhost:5087/swagger
```

**Probar conexión Oracle:**
```bash
curl http://localhost:5087/api/aeropuertos
# Debería devolver [] (vacío) o datos si ya tienes registros
```

---

## PASO 5 — Levantar el frontend

```bash
cd aeropuerto_v3

# Instalar dependencias (primera vez)
npm install

# Crear archivo de configuración
cp .env.example .env
# El archivo .env ya tiene: EXPO_PUBLIC_BE_URL=http://localhost:5087

# Iniciar Expo
npx expo start

# Opciones:
#   Presiona W  → abrir en navegador web (recomendado para testear)
#   Presiona A  → emulador Android
#   Presiona I  → simulador iOS
#   Escanea QR → Expo Go en tu teléfono
```

---

## PASO 6 — Insertar datos de prueba

Ejecuta en SQL Developer (conectado como `aurora_user`):

```sql
-- ── Aeropuerto La Aurora ──────────────────────────────────────────
INSERT INTO aeropuertos VALUES (
    'GUA', 'Aeropuerto Internacional La Aurora',
    'Ciudad de Guatemala', 'Guatemala',
    'Centroamérica', 'América', 'UTC-6',
    14.5833, -90.5275, 1503, 1, 14, 1, SYSDATE, 'SYS'
);

-- ── Aerolíneas ────────────────────────────────────────────────────
INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('Avianca Guatemala', 'AV', 'AVA', 'Colombia', 12, 18, 'STAR_ALLIANCE', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('American Airlines', 'AA', 'Estados Unidos', 850, 350, 'ONEWORLD', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, pais_origen, flota_total, destinos_totales, activo)
VALUES ('Copa Airlines', 'CM', 'Panamá', 110, 80, 1);

-- ── Modelos de avión ──────────────────────────────────────────────
INSERT INTO modelos_aviones (nombre_modelo, fabricante, capacidad_pasajeros, autonomia_km, velocidad_crucero_kmh, tripulacion_minima, activo)
VALUES ('Boeing 737-800', 'Boeing', 162, 5765, 840, 2, 1);

INSERT INTO modelos_aviones (nombre_modelo, fabricante, capacidad_pasajeros, autonomia_km, velocidad_crucero_kmh, tripulacion_minima, activo)
VALUES ('Airbus A320', 'Airbus', 150, 6100, 833, 2, 1);

-- ── Temporadas ────────────────────────────────────────────────────
INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Alta Navidad', DATE '2025-12-01', DATE '2026-01-15', 1.8, 1);

INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Semana Santa', DATE '2026-04-01', DATE '2026-04-15', 1.6, 1);

INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Baja Enero', DATE '2026-01-16', DATE '2026-02-28', 0.75, 1);

COMMIT;

-- Verificar
SELECT 'aeropuertos' t, COUNT(*) n FROM aeropuertos
UNION ALL SELECT 'aerolineas', COUNT(*) FROM aerolineas
UNION ALL SELECT 'modelos_aviones', COUNT(*) FROM modelos_aviones
UNION ALL SELECT 'temporadas_vuelo', COUNT(*) FROM temporadas_vuelo;
```

---

## PASO 7 — Verificar integración completa

Una vez todo levantado, en el frontend:

1. Login con cuenta demo: `admin` / `1234`
2. En el Dashboard Admin verás el indicador 🟢 **Oracle · En vivo**
3. Módulo 1 (Infraestructura) → verás el aeropuerto GUA real de Oracle
3. Módulo 3 (Aerolíneas) → verás las aerolíneas reales
4. Para verificar desde código, ejecuta en consola del navegador:
```javascript
import('/utils/backendTest').then(m => m.runBackendTests())
```

---

## Resumen de credenciales

| Servicio | Usuario | Contraseña |
|---|---|---|
| Oracle SYS | `SYS` (SYSDBA) | `oracle` |
| Oracle Aurora | `aurora_user` | `Aurora2024#` |
| Backend .NET | — | — |
| App demo admin | `admin` | `1234` |
| App demo cliente | `cliente` | `1234` |

---

## Troubleshooting frecuente

### "ORA-65096: invalid common user or role name"
→ Tu Oracle es **CDB (Multitenant)**. Ejecuta primero:
```sql
ALTER SESSION SET CONTAINER = XEPDB1;
-- (o el nombre de tu PDB)
```

### "ORA-01017: invalid username/password"
→ La contraseña puede tener caracteres especiales. Prueba con comillas:
```sql
CREATE USER aurora_user IDENTIFIED BY "Aurora2024#";
```
O usa una contraseña más simple: `Aurora2024`

### Backend da 500 en endpoints distintos a /api/aeropuertos
→ Falta registrar el servicio en `Program.cs` (ver Paso 3.2)

### "Network request failed" en Expo en dispositivo físico
→ Cambia en `.env`:
```
EXPO_PUBLIC_BE_URL=http://TU_IP_LOCAL:5087
```
Para encontrar tu IP: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)

### CORS error en navegador
→ Agrega `http://localhost:8081` a la política CORS (ver Paso 3.3)
