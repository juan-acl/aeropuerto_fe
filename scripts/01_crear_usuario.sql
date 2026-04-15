-- =================================================================
-- PASO 1: CREAR USUARIO DE LA APLICACIÓN
-- Ejecutar como: SYS / oracle  con rol SYSDBA
-- Conexión: localhost:1521  SID: ORCL
-- =================================================================

-- En Oracle 21c (CDB) apuntar al PDB primero
-- Si usas PDB:
-- ALTER SESSION SET CONTAINER = ORCLPDB;
-- Si usas SID directamente (como tienes configurado):
-- No necesitas cambiar de contenedor

-- ─── Crear usuario ────────────────────────────────────────────
CREATE USER aurora_user
  IDENTIFIED BY aurora_pass2024
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- ─── Permisos mínimos necesarios ─────────────────────────────
GRANT CONNECT, RESOURCE TO aurora_user;
GRANT CREATE SESSION    TO aurora_user;
GRANT CREATE TABLE      TO aurora_user;
GRANT CREATE VIEW       TO aurora_user;
GRANT CREATE SEQUENCE   TO aurora_user;
GRANT CREATE PROCEDURE  TO aurora_user;
GRANT CREATE TRIGGER    TO aurora_user;
GRANT CREATE INDEX      TO aurora_user;
GRANT UNLIMITED TABLESPACE TO aurora_user;

-- ─── Verificar ────────────────────────────────────────────────
SELECT username, account_status, default_tablespace
FROM   dba_users
WHERE  username = 'AURORA_USER';

COMMIT;
