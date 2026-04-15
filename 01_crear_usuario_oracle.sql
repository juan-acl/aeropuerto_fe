-- =====================================================
-- PASO 1: CREAR USUARIO DE APLICACIÓN
-- Ejecutar como SYS con rol SYSDBA en SQL Developer
-- Conexión: localhost:1521 SID=ORCL  Usuario=SYS  Pass=oracle
-- =====================================================

-- 1. Crear el usuario con contraseña segura
CREATE USER aurora_app IDENTIFIED BY AuroraApp2024$
    DEFAULT TABLESPACE USERS
    TEMPORARY TABLESPACE TEMP
    QUOTA UNLIMITED ON USERS;

-- 2. Permisos de sesión y conexión
GRANT CREATE SESSION        TO aurora_app;
GRANT CONNECT               TO aurora_app;
GRANT RESOURCE              TO aurora_app;

-- 3. Permisos de objetos (tablas, vistas, secuencias)
GRANT CREATE TABLE          TO aurora_app;
GRANT CREATE VIEW           TO aurora_app;
GRANT CREATE SEQUENCE       TO aurora_app;
GRANT CREATE PROCEDURE      TO aurora_app;
GRANT CREATE TRIGGER        TO aurora_app;
GRANT CREATE INDEX          TO aurora_app;
GRANT CREATE TYPE           TO aurora_app;
GRANT CREATE SYNONYM        TO aurora_app;

-- 4. Permisos de sistema adicionales
GRANT ALTER  SESSION        TO aurora_app;
GRANT SELECT ANY DICTIONARY TO aurora_app;
GRANT SELECT ANY TABLE      TO aurora_app;

-- 5. Cuota de espacio
ALTER USER aurora_app QUOTA UNLIMITED ON USERS;

-- 6. Verificar que el usuario fue creado
SELECT username, account_status, default_tablespace, created
FROM   dba_users
WHERE  username = 'AURORA_APP';

-- =====================================================
-- RESULTADO ESPERADO:
-- USERNAME    ACCOUNT_STATUS   DEFAULT_TABLESPACE
-- AURORA_APP  OPEN             USERS
-- =====================================================
