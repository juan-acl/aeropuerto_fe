-- =====================================================
-- SETUP ORACLE 21c — Aeropuerto La Aurora
-- Ejecutar como: SYS / oracle (SYSDBA)
-- Host: localhost | Port: 1521 | SID: ORCL
-- =====================================================

-- PASO 0: Verificar si es CDB o non-CDB
SELECT CDB, NAME, DB_UNIQUE_NAME FROM V$DATABASE;

-- =====================================================
-- SI CDB=NO (non-CDB): Ejecutar directamente desde aquí
-- SI CDB=YES: Primero ejecutar:
--   ALTER SESSION SET CONTAINER = XEPDB1;
--   (o el nombre de tu PDB: SELECT NAME FROM V$PDBS;)
-- =====================================================

-- PASO 1: Crear usuario aurora_user
CREATE USER aurora_user IDENTIFIED BY "Aurora2024#"
    DEFAULT TABLESPACE USERS
    TEMPORARY TABLESPACE TEMP
    QUOTA UNLIMITED ON USERS;

-- PASO 2: Dar permisos completos
GRANT CONNECT, RESOURCE TO aurora_user;
GRANT CREATE SESSION     TO aurora_user;
GRANT CREATE TABLE       TO aurora_user;
GRANT CREATE SEQUENCE    TO aurora_user;
GRANT CREATE VIEW        TO aurora_user;
GRANT CREATE PROCEDURE   TO aurora_user;
GRANT CREATE TRIGGER     TO aurora_user;
GRANT CREATE INDEX       TO aurora_user;
GRANT CREATE TYPE        TO aurora_user;
GRANT CREATE SYNONYM     TO aurora_user;
GRANT ALTER SESSION      TO aurora_user;
GRANT UNLIMITED TABLESPACE TO aurora_user;
GRANT SELECT ANY DICTIONARY TO aurora_user;
GRANT SELECT ANY TABLE   TO aurora_user;

-- PASO 3: Verificar
SELECT username, account_status, default_tablespace, profile
FROM dba_users
WHERE username = 'AURORA_USER';

-- Debe mostrar: AURORA_USER | OPEN | USERS | DEFAULT

-- =====================================================
-- PASO 4: Conectar como aurora_user y crear tablas
-- Crear nueva conexión en SQL Developer:
--   Username: aurora_user
--   Password: Aurora2024#
--   SID: ORCL
-- Luego abrir y ejecutar: incrementos.sql
-- =====================================================
