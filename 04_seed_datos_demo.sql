-- =====================================================
-- PASO 4: DATOS DEMO PARA TESTEAR
-- Ejecutar como aurora_app después de verificación
-- =====================================================

-- 1. Aeropuertos
INSERT INTO aeropuertos VALUES ('GUA', 'Aeropuerto Internacional La Aurora', 'Ciudad de Guatemala', 'Guatemala', 'Centroamérica', 'América', 'UTC-6', 14.5833, -90.5275, 1503, 1, 14, 1, SYSDATE, 'aurora_app');
INSERT INTO aeropuertos VALUES ('MIA', 'Miami International Airport', 'Miami', 'Estados Unidos', 'Norteamérica', 'América', 'UTC-5', 25.7959, -80.2870, 3, 3, 132, 1, SYSDATE, 'aurora_app');
INSERT INTO aeropuertos VALUES ('BOG', 'Aeropuerto Internacional El Dorado', 'Bogotá', 'Colombia', 'Suramérica', 'América', 'UTC-5', 4.7016, -74.1469, 2547, 2, 58, 1, SYSDATE, 'aurora_app');
INSERT INTO aeropuertos VALUES ('MEX', 'Aeropuerto Internacional de la Ciudad de México', 'Ciudad de México', 'México', 'Centroamérica', 'América', 'UTC-6', 19.4363, -99.0721, 2230, 2, 62, 1, SYSDATE, 'aurora_app');
INSERT INTO aeropuertos VALUES ('MAD', 'Aeropuerto Adolfo Suárez Madrid-Barajas', 'Madrid', 'España', 'Europa Sur', 'Europa', 'UTC+1', 40.4936, -3.5668, 609, 4, 197, 1, SYSDATE, 'aurora_app');
INSERT INTO aeropuertos VALUES ('FRS', 'Aeropuerto Internacional Mundo Maya', 'Flores', 'Guatemala', 'Centroamérica', 'América', 'UTC-6', 16.9138, -89.8664, 128, 1, 4, 1, SYSDATE, 'aurora_app');

-- 2. Tipo de aerolínea
INSERT INTO tipos_aerolinea (descripcion, codigo) VALUES ('Comercial Internacional', 'COM_INT');
INSERT INTO tipos_aerolinea (descripcion, codigo) VALUES ('Comercial Nacional', 'COM_NAC');
INSERT INTO tipos_aerolinea (descripcion, codigo) VALUES ('Carga', 'CARGA');

-- 3. Aerolíneas
INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('Avianca Guatemala', 'AV', 'AVA', 'Colombia', 12, 18, 'STAR_ALLIANCE', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('American Airlines', 'AA', 'AAL', 'Estados Unidos', 850, 350, 'ONEWORLD', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('Copa Airlines', 'CM', 'CMP', 'Panamá', 110, 81, 'STAR_ALLIANCE', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('Iberia', 'IB', 'IBE', 'España', 120, 145, 'ONEWORLD', 1);

INSERT INTO aerolineas (nombre_aerolinea, codigo_iata, codigo_oaci, pais_origen, flota_total, destinos_totales, alianza, activo)
VALUES ('TACA Airlines', 'TA', 'TAI', 'El Salvador', 65, 42, 'NINGUNA', 1);

-- 4. Modelo de avión (requerido por vuelos)
INSERT INTO fabricantes_aviones (nombre_fabricante, pais, activo) VALUES ('Boeing', 'Estados Unidos', 1);
INSERT INTO fabricantes_aviones (nombre_fabricante, pais, activo) VALUES ('Airbus', 'Francia', 1);

INSERT INTO modelos_aviones (id_fabricante, nombre_modelo, capacidad_pasajeros, capacidad_carga_kg, autonomia_km, velocidad_crucero_kmh, activo)
VALUES (1, 'Boeing 737-800', 162, 45000, 5765, 842, 1);

INSERT INTO modelos_aviones (id_fabricante, nombre_modelo, capacidad_pasajeros, capacidad_carga_kg, autonomia_km, velocidad_crucero_kmh, activo)
VALUES (2, 'Airbus A320', 180, 38000, 6150, 833, 1);

INSERT INTO modelos_aviones (id_fabricante, nombre_modelo, capacidad_pasajeros, capacidad_carga_kg, autonomia_km, velocidad_crucero_kmh, activo)
VALUES (2, 'Airbus A319', 124, 27000, 6900, 828, 1);

-- 5. Puertas de embarque
INSERT INTO puertas_embarque (codigo_aeropuerto, numero_puerta, terminal, tipo_puerta, capacidad_maxima, activa)
VALUES ('GUA', '1',  'T1', 'INTERNACIONAL', 200, 1);
INSERT INTO puertas_embarque (codigo_aeropuerto, numero_puerta, terminal, tipo_puerta, capacidad_maxima, activa)
VALUES ('GUA', '2',  'T1', 'INTERNACIONAL', 200, 1);
INSERT INTO puertas_embarque (codigo_aeropuerto, numero_puerta, terminal, tipo_puerta, capacidad_maxima, activa)
VALUES ('GUA', '5',  'T1', 'INTERNACIONAL', 200, 1);
INSERT INTO puertas_embarque (codigo_aeropuerto, numero_puerta, terminal, tipo_puerta, capacidad_maxima, activa)
VALUES ('GUA', '7',  'T1', 'NACIONAL', 150, 1);
INSERT INTO puertas_embarque (codigo_aeropuerto, numero_puerta, terminal, tipo_puerta, capacidad_maxima, activa)
VALUES ('GUA', '10', 'T1', 'MIXTA', 180, 1);

-- 6. Programas de vuelo
INSERT INTO programas_vuelo (numero_vuelo, id_aerolinea, aeropuerto_origen, aeropuerto_destino, tipo_vuelo, dias_semana, duracion_estimada_minutos, clase_servicio, activo, fecha_inicio)
VALUES ('AV450', 1, 'GUA', 'BOG', 'INTERNACIONAL', 'LUN,MIE,VIE', 195, 'MIXTA', 1, SYSDATE);

INSERT INTO programas_vuelo (numero_vuelo, id_aerolinea, aeropuerto_origen, aeropuerto_destino, tipo_vuelo, dias_semana, duracion_estimada_minutos, clase_servicio, activo, fecha_inicio)
VALUES ('AA900', 2, 'GUA', 'MIA', 'INTERNACIONAL', 'LUN,MAR,MIE,JUE,VIE,SAB,DOM', 190, 'MIXTA', 1, SYSDATE);

INSERT INTO programas_vuelo (numero_vuelo, id_aerolinea, aeropuerto_origen, aeropuerto_destino, tipo_vuelo, dias_semana, duracion_estimada_minutos, clase_servicio, activo, fecha_inicio)
VALUES ('IB6830', 4, 'GUA', 'MAD', 'INTERNACIONAL', 'LUN,JUE,SAB', 660, 'MIXTA', 1, SYSDATE);

INSERT INTO programas_vuelo (numero_vuelo, id_aerolinea, aeropuerto_origen, aeropuerto_destino, tipo_vuelo, dias_semana, duracion_estimada_minutos, clase_servicio, activo, fecha_inicio)
VALUES ('CM320', 3, 'GUA', 'MEX', 'INTERNACIONAL', 'MAR,JUE,SAB', 165, 'ECONOMICA', 1, SYSDATE);

INSERT INTO programas_vuelo (numero_vuelo, id_aerolinea, aeropuerto_origen, aeropuerto_destino, tipo_vuelo, dias_semana, duracion_estimada_minutos, clase_servicio, activo, fecha_inicio)
VALUES ('TA210', 5, 'GUA', 'FRS', 'NACIONAL', 'LUN,MIE,VIE', 60, 'ECONOMICA', 1, SYSDATE);

-- 7. Vuelos (próximos 7 días)
INSERT INTO vuelos (id_programa, fecha_vuelo, hora_salida_programada, hora_llegada_programada, id_modelo_avion, matricula_avion, plazas_vacias, plazas_ocupadas, estado_vuelo, id_puerta_salida)
VALUES (1, TRUNC(SYSDATE)+1, TRUNC(SYSDATE)+1+9/24, TRUNC(SYSDATE)+1+12.25/24, 1, 'TG-ANA', 22, 140, 'PROGRAMADO', 5);

INSERT INTO vuelos (id_programa, fecha_vuelo, hora_salida_programada, hora_llegada_programada, id_modelo_avion, matricula_avion, plazas_vacias, plazas_ocupadas, estado_vuelo, id_puerta_salida)
VALUES (2, TRUNC(SYSDATE)+1, TRUNC(SYSDATE)+1+18.5/24, TRUNC(SYSDATE)+1+21.67/24, 2, 'TG-BOB', 45, 135, 'PROGRAMADO', 1);

INSERT INTO vuelos (id_programa, fecha_vuelo, hora_salida_programada, hora_llegada_programada, id_modelo_avion, matricula_avion, plazas_vacias, plazas_ocupadas, estado_vuelo, id_puerta_salida)
VALUES (3, TRUNC(SYSDATE)+2, TRUNC(SYSDATE)+2+23/24, TRUNC(SYSDATE)+3+10/24, 2, 'TG-CAR', 80, 100, 'PROGRAMADO', 2);

INSERT INTO vuelos (id_programa, fecha_vuelo, hora_salida_programada, hora_llegada_programada, id_modelo_avion, matricula_avion, plazas_vacias, plazas_ocupadas, estado_vuelo, id_puerta_salida)
VALUES (4, TRUNC(SYSDATE), TRUNC(SYSDATE)+7/24, TRUNC(SYSDATE)+9.75/24, 3, 'TG-DAR', 15, 109, 'EN_VUELO', 7);

INSERT INTO vuelos (id_programa, fecha_vuelo, hora_salida_programada, hora_llegada_programada, id_modelo_avion, matricula_avion, plazas_vacias, plazas_ocupadas, estado_vuelo, id_puerta_salida)
VALUES (5, TRUNC(SYSDATE)+1, TRUNC(SYSDATE)+1+14/24, TRUNC(SYSDATE)+1+15/24, 3, 'TG-EVA', 28, 96, 'PROGRAMADO', 10);

-- 8. Departamentos (requerido por empleados)
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Operaciones', 'OPS', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Seguridad', 'SEG', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Finanzas', 'FIN', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('RRHH', 'RRHH', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Tecnología', 'TI', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Mantenimiento', 'MNT', 1);
INSERT INTO departamentos (nombre_departamento, codigo, activo) VALUES ('Administración', 'ADM', 1);

-- 9. Empleados
INSERT INTO empleados (codigo_empleado, nombres, apellidos, tipo_documento, numero_documento, email_institucional, id_departamento, cargo, activo)
VALUES ('EMP001', 'Admin', 'General', 'DPI', '0000000000001', 'admin@aurora.aero', 5, 'Administrador TI', 1);

INSERT INTO empleados (codigo_empleado, nombres, apellidos, tipo_documento, numero_documento, email_institucional, id_departamento, cargo, activo)
VALUES ('EMP002', 'Carlos', 'Méndez', 'DPI', '1234567890123', 'c.mendez@aurora.aero', 1, 'Agente Recepción', 1);

INSERT INTO empleados (codigo_empleado, nombres, apellidos, tipo_documento, numero_documento, email_institucional, id_departamento, cargo, activo)
VALUES ('EMP003', 'Ana', 'Hernández', 'DPI', '9876543210321', 'a.hernandez@aurora.aero', 1, 'Agente Check-in', 1);

INSERT INTO empleados (codigo_empleado, nombres, apellidos, tipo_documento, numero_documento, email_institucional, id_departamento, cargo, activo)
VALUES ('EMP004', 'Roberto', 'Pérez', 'DPI', '5555555555555', 'r.perez@aurora.aero', 1, 'Agente Operaciones', 1);

INSERT INTO empleados (codigo_empleado, nombres, apellidos, tipo_documento, numero_documento, email_institucional, id_departamento, cargo, activo)
VALUES ('EMP005', 'María', 'López', 'DPI', '1111111111111', 'm.lopez@aurora.aero', 2, 'Oficial Seguridad', 1);

-- 10. Roles del sistema
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('ADMIN', 'Administrador total del sistema', 1);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('JEFE_OPERACIONES', 'Jefe de operaciones aeroportuarias', 2);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('OPERACIONES', 'Agente de operaciones', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('RECEPCIONISTA', 'Agente de recepción', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('CHECKIN', 'Agente de check-in', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('SEGURIDAD', 'Oficial de seguridad', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('FINANZAS', 'Analista financiero', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('RRHH', 'Analista RRHH', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('MANTENIMIENTO', 'Técnico mantenimiento', 3);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('SUPERVISOR', 'Supervisor turno', 2);
INSERT INTO roles_sistema (nombre_rol, descripcion, nivel_jerarquico) VALUES ('CLIENTE', 'Pasajero / Usuario final', 5);

-- 11. Usuarios del sistema
-- NOTA: passwords hasheados con SHA-256 de "1234"
-- Hash de "1234" = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
INSERT INTO usuarios_sistema (id_empleado, nombre_usuario, password_hash, email_institucional, activo)
VALUES (1, 'admin', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'admin@aurora.aero', 1);

INSERT INTO usuarios_sistema (id_empleado, nombre_usuario, password_hash, email_institucional, activo)
VALUES (2, 'recepcion', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'c.mendez@aurora.aero', 1);

INSERT INTO usuarios_sistema (id_empleado, nombre_usuario, password_hash, email_institucional, activo)
VALUES (3, 'checkin', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'a.hernandez@aurora.aero', 1);

INSERT INTO usuarios_sistema (id_empleado, nombre_usuario, password_hash, email_institucional, activo)
VALUES (4, 'operaciones', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'r.perez@aurora.aero', 1);

INSERT INTO usuarios_sistema (id_empleado, nombre_usuario, password_hash, email_institucional, activo)
VALUES (5, 'seguridad', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'm.lopez@aurora.aero', 1);

-- 12. Asignación de roles a usuarios
INSERT INTO usuarios_roles (id_usuario_sistema, id_rol_sistema, asignado_por, fecha_asignacion)
VALUES (1, 1, 1, SYSDATE);  -- admin → ADMIN

INSERT INTO usuarios_roles (id_usuario_sistema, id_rol_sistema, asignado_por, fecha_asignacion)
VALUES (2, 4, 1, SYSDATE);  -- recepcion → RECEPCIONISTA

INSERT INTO usuarios_roles (id_usuario_sistema, id_rol_sistema, asignado_por, fecha_asignacion)
VALUES (3, 5, 1, SYSDATE);  -- checkin → CHECKIN

INSERT INTO usuarios_roles (id_usuario_sistema, id_rol_sistema, asignado_por, fecha_asignacion)
VALUES (4, 3, 1, SYSDATE);  -- operaciones → OPERACIONES

INSERT INTO usuarios_roles (id_usuario_sistema, id_rol_sistema, asignado_por, fecha_asignacion)
VALUES (5, 6, 1, SYSDATE);  -- seguridad → SEGURIDAD

-- 13. Pasajero demo (para pruebas cliente)
INSERT INTO pasajeros (nombres, apellidos, tipo_documento, numero_documento, email, telefono, nacionalidad, activo)
VALUES ('Andrea', 'Morales', 'DPI', '2233445566778', 'a.morales@gmail.com', '50299991234', 'Guatemalteca', 1);

-- 14. Programa de lealtad para pasajero demo
INSERT INTO programa_lealtad (id_pasajero, nivel_membresia, puntos_acumulados, puntos_canjeables, fecha_ingreso, millas_acumuladas, activo)
VALUES (1, 'BRONCE', 1250, 1250, SYSDATE-30, 2300, 1);

-- 15. Hoteles cercanos
INSERT INTO hoteles_cercanos (codigo_aeropuerto, nombre_hotel, categoria, distancia_km, telefono, tarifa_noche_desde, tiene_shuttle, activo)
VALUES ('GUA', 'Westin Camino Real Guatemala', '5*', 3.2, '2368-3000', 180, 1, 1);

INSERT INTO hoteles_cercanos (codigo_aeropuerto, nombre_hotel, categoria, distancia_km, telefono, tarifa_noche_desde, tiene_shuttle, activo)
VALUES ('GUA', 'Hilton Guatemala City', '5*', 4.5, '2420-3000', 165, 1, 1);

INSERT INTO hoteles_cercanos (codigo_aeropuerto, nombre_hotel, categoria, distancia_km, telefono, tarifa_noche_desde, tiene_shuttle, activo)
VALUES ('GUA', 'Real InterContinental', '5*', 5.1, '2413-4444', 145, 0, 1);

INSERT INTO hoteles_cercanos (codigo_aeropuerto, nombre_hotel, categoria, distancia_km, telefono, tarifa_noche_desde, tiene_shuttle, activo)
VALUES ('GUA', 'Hotel Meliá Guatemala', '4*', 6.0, '2385-5000', 110, 1, 1);

-- 16. Temporadas de vuelo
INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Semana Santa 2025', DATE '2025-04-10', DATE '2025-04-20', 1.85, 1);

INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Alta Navidad', DATE '2025-12-15', DATE '2026-01-05', 1.95, 0);

INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Baja Febrero', DATE '2025-02-01', DATE '2025-02-28', 0.75, 0);

INSERT INTO temporadas_vuelo (nombre_temporada, fecha_inicio, fecha_fin, factor_demanda, activa)
VALUES ('Temporada Normal', DATE '2025-01-01', DATE '2025-12-31', 1.00, 1);

COMMIT;

-- Verificar seed data
SELECT 'aeropuertos: '      || COUNT(*) FROM aeropuertos;
SELECT 'aerolineas: '       || COUNT(*) FROM aerolineas;
SELECT 'programas_vuelo: '  || COUNT(*) FROM programas_vuelo;
SELECT 'vuelos: '           || COUNT(*) FROM vuelos;
SELECT 'empleados: '        || COUNT(*) FROM empleados;
SELECT 'usuarios_sistema: ' || COUNT(*) FROM usuarios_sistema;
SELECT 'hoteles_cercanos: ' || COUNT(*) FROM hoteles_cercanos;
