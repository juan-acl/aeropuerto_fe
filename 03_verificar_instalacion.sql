-- =====================================================
-- PASO 3: VERIFICACIÓN DE INSTALACIÓN
-- Ejecutar como aurora_app después de correr incrementos.sql
-- =====================================================

-- Contar tablas instaladas
SELECT 'Tablas instaladas: ' || COUNT(*) AS resultado
FROM   user_tables;
-- Debe mostrar: Tablas instaladas: 240

-- Verificar tablas clave
SELECT table_name, num_rows
FROM   user_tables
WHERE  table_name IN (
    'AEROPUERTOS', 'AEROLINEAS', 'VUELOS', 'RESERVAS',
    'PASAJEROS', 'EMPLEADOS', 'TRIPULACION', 'USUARIOS_SISTEMA',
    'ROLES_SISTEMA', 'PROGRAMA_LEALTAD', 'HOTELES_CERCANOS',
    'TEMPORADAS_VUELO', 'PROGRAMAS_VUELO', 'PASES_ABORDAJE',
    'CHECKIN_DIGITAL'
)
ORDER BY table_name;

-- Verificar índices
SELECT 'Índices creados: ' || COUNT(*) AS resultado
FROM   user_indexes;
-- Debe mostrar ~172 índices

-- Verificar estructura de tablas clave
DESC vuelos;
DESC reservas;
DESC usuarios_sistema;

COMMIT;
