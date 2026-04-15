-- =================================================================
-- PASO 3: DATOS DE PRUEBA
-- Ejecutar como: aurora_user / aurora_pass2024
-- DESPUÉS de incrementos.sql
-- =================================================================

-- ─── Aeropuertos ─────────────────────────────────────────────
INSERT INTO aeropuertos VALUES ('GUA','Aeropuerto Internacional La Aurora','Ciudad de Guatemala','Guatemala','Centroamérica','América','UTC-6',14.5833,-90.5275,1503,1,14,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('FRS','Aeropuerto Internacional Mundo Maya','Flores','Guatemala','Centroamérica','América','UTC-6',16.9138,-89.8664,123,1,6,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('BOG','Aeropuerto El Dorado','Bogotá','Colombia','Sudamérica','América','UTC-5',4.7016,-74.1469,2548,2,62,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('MIA','Aeropuerto Internacional de Miami','Miami','Estados Unidos','Norteamérica','América','UTC-5',25.7959,-80.2870,3,3,131,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('MEX','Aeropuerto Benito Juárez','Ciudad de México','México','Norteamérica','América','UTC-6',19.4363,-99.0721,2230,2,75,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('LAX','Aeropuerto Internacional de Los Ángeles','Los Ángeles','Estados Unidos','Norteamérica','América','UTC-8',33.9425,-118.4081,38,4,128,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('MAD','Aeropuerto Madrid-Barajas','Madrid','España','Europa','Europa','UTC+1',40.4983,-3.5676,609,4,104,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('LIM','Aeropuerto Jorge Chávez','Lima','Perú','Sudamérica','América','UTC-5',-12.0219,-77.1143,113,1,48,1,SYSDATE,'SEED');
INSERT INTO aeropuertos VALUES ('CUN','Aeropuerto Internacional de Cancún','Cancún','México','Norteamérica','América','UTC-5',21.0365,-86.8771,4,4,68,1,SYSDATE,'SEED');

-- ─── Tipos de aeropuerto ──────────────────────────────────────
INSERT INTO tipos_aeropuerto (descripcion, codigo, activo) VALUES ('Internacional','INTL',1);
INSERT INTO tipos_aeropuerto (descripcion, codigo, activo) VALUES ('Nacional','NACL',1);
INSERT INTO tipos_aeropuerto (descripcion, codigo, activo) VALUES ('Regional','REGN',1);

-- ─── Aerolíneas ───────────────────────────────────────────────
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('Avianca Guatemala','AV','AVA','Colombia',12,18,'STAR_ALLIANCE',1);
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('American Airlines','AA','AAL','Estados Unidos',850,350,'ONEWORLD',1);
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('Copa Airlines','CM','CMP','Panamá',104,80,'STAR_ALLIANCE',1);
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('Iberia','IB','IBE','España',98,140,'ONEWORLD',1);
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('LATAM Airlines','LA','LAN','Chile',340,150,'ONEWORLD',1);
INSERT INTO aerolineas (nombre_aerolinea,codigo_iata,codigo_oaci,pais_origen,flota_total,destinos_totales,alianza,activo)
  VALUES ('Volaris','Y4','VOI','México',90,65,'NINGUNA',1);

-- ─── Modelos de aviones ───────────────────────────────────────
INSERT INTO modelos_aviones (nombre_modelo,fabricante,capacidad_pasajeros,capacidad_carga_kg,autonomia_km,velocidad_crucero_kmh,tripulacion_minima,activo)
  VALUES ('Boeing 737-800','Boeing',162,21000,5765,842,6,1);
INSERT INTO modelos_aviones (nombre_modelo,fabricante,capacidad_pasajeros,capacidad_carga_kg,autonomia_km,velocidad_crucero_kmh,tripulacion_minima,activo)
  VALUES ('Airbus A320-200','Airbus',180,18000,6100,840,6,1);
INSERT INTO modelos_aviones (nombre_modelo,fabricante,capacidad_pasajeros,capacidad_carga_kg,autonomia_km,velocidad_crucero_kmh,tripulacion_minima,activo)
  VALUES ('Airbus A321neo','Airbus',220,21000,7400,833,6,1);

-- ─── Temporadas de vuelo ──────────────────────────────────────
INSERT INTO temporadas_vuelo (nombre_temporada,fecha_inicio,fecha_fin,factor_demanda,activa)
  VALUES ('Temporada Alta Navidad',DATE '2024-12-15',DATE '2025-01-10',1.85,1);
INSERT INTO temporadas_vuelo (nombre_temporada,fecha_inicio,fecha_fin,factor_demanda,activa)
  VALUES ('Semana Santa 2025',DATE '2025-04-10',DATE '2025-04-20',1.70,1);
INSERT INTO temporadas_vuelo (nombre_temporada,fecha_inicio,fecha_fin,factor_demanda,activa)
  VALUES ('Temporada Baja Enero',DATE '2025-01-15',DATE '2025-02-28',0.80,1);
INSERT INTO temporadas_vuelo (nombre_temporada,fecha_inicio,fecha_fin,factor_demanda,activa)
  VALUES ('Verano 2025',DATE '2025-06-01',DATE '2025-08-31',1.40,1);
INSERT INTO temporadas_vuelo (nombre_temporada,fecha_inicio,fecha_fin,factor_demanda,activa)
  VALUES ('Operacion Normal',DATE '2025-01-01',DATE '2025-12-31',1.00,1);

-- ─── Puertas de embarque GUA ──────────────────────────────────
INSERT INTO puertas_embarque (codigo_aeropuerto,numero_puerta,terminal,tipo_puerta,capacidad_maxima,tiene_pasarela,activo)
  VALUES ('GUA','1A','T1','INTERNACIONAL',220,1,1);
INSERT INTO puertas_embarque (codigo_aeropuerto,numero_puerta,terminal,tipo_puerta,capacidad_maxima,tiene_pasarela,activo)
  VALUES ('GUA','2B','T1','INTERNACIONAL',180,1,1);
INSERT INTO puertas_embarque (codigo_aeropuerto,numero_puerta,terminal,tipo_puerta,capacidad_maxima,tiene_pasarela,activo)
  VALUES ('GUA','3C','T1','NACIONAL',160,0,1);
INSERT INTO puertas_embarque (codigo_aeropuerto,numero_puerta,terminal,tipo_puerta,capacidad_maxima,tiene_pasarela,activo)
  VALUES ('GUA','4D','T1','MIXTA',200,1,1);
INSERT INTO puertas_embarque (codigo_aeropuerto,numero_puerta,terminal,tipo_puerta,capacidad_maxima,tiene_pasarela,activo)
  VALUES ('GUA','5E','T1','INTERNACIONAL',240,1,1);

-- ─── Pistas GUA ───────────────────────────────────────────────
INSERT INTO pistas_aterrizaje (codigo_aeropuerto,numero_pista,longitud_metros,anchura_metros,superficie,iluminacion_nocturna,sistema_ils,activo)
  VALUES ('GUA','01/19',2987,60,'ASFALTO',1,1,1);

-- ─── Pasajeros de prueba ──────────────────────────────────────
INSERT INTO pasajeros (nombres,apellidos,tipo_documento,numero_documento,fecha_nacimiento,nacionalidad,email,telefono,activo)
  VALUES ('Andrea','Morales','DPI','1234567890123',DATE '1990-05-15','Guatemalteca','a.morales@gmail.com','+502 5555-1234',1);
INSERT INTO pasajeros (nombres,apellidos,tipo_documento,numero_documento,fecha_nacimiento,nacionalidad,email,telefono,activo)
  VALUES ('Carlos','Méndez','DPI','9876543210987',DATE '1985-08-22','Guatemalteco','c.mendez@email.com','+502 5555-5678',1);
INSERT INTO pasajeros (nombres,apellidos,tipo_documento,numero_documento,fecha_nacimiento,nacionalidad,email,telefono,activo)
  VALUES ('María','López','PASAPORTE','GT123456',DATE '1992-11-08','Guatemalteca','m.lopez@email.com','+502 5555-9012',1);

-- ─── Programa de lealtad ──────────────────────────────────────
INSERT INTO programa_lealtad (id_pasajero,nivel_membresia,puntos_acumulados,millas_acumuladas,activo)
  VALUES (1,'ORO',45800,82400,1);
INSERT INTO programa_lealtad (id_pasajero,nivel_membresia,puntos_acumulados,millas_acumuladas,activo)
  VALUES (2,'PLATA',12400,23500,1);
INSERT INTO programa_lealtad (id_pasajero,nivel_membresia,puntos_acumulados,millas_acumuladas,activo)
  VALUES (3,'BRONCE',2100,4200,1);

-- ─── Roles del sistema ────────────────────────────────────────
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('ADMIN','Administrador - acceso total',1,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('JEFE_OPERACIONES','Jefe de operaciones aeroportuarias',2,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('SUPERVISOR','Supervisor de área',3,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('OPERACIONES','Agente de operaciones de vuelo',4,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('RECEPCIONISTA','Agente de recepción',5,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('CHECKIN','Agente de check-in',5,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('SEGURIDAD','Oficial de seguridad',4,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('FINANZAS','Analista financiero',4,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('RRHH','Recursos humanos',4,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('MANTENIMIENTO','Técnico de mantenimiento',4,1);
INSERT INTO roles_sistema (nombre_rol,descripcion,nivel_jerarquico,activo)
  VALUES ('CLIENTE','Pasajero - usuario app',10,1);

-- ─── Usuarios del sistema ─────────────────────────────────────
-- Contraseñas hasheadas: todas usan "1234" con bcrypt (demo)
-- En producción usar sp de cambio de password
INSERT INTO usuarios_sistema (id_empleado,nombre_usuario,password_hash,email_institucional,activo,requiere_cambio_password)
  VALUES (NULL,'admin','$2a$10$demo_hash_admin','admin@aurora.aero',1,0);
INSERT INTO usuarios_sistema (id_empleado,nombre_usuario,password_hash,email_institucional,activo,requiere_cambio_password)
  VALUES (NULL,'operaciones','$2a$10$demo_hash_ops','operaciones@aurora.aero',1,0);
INSERT INTO usuarios_sistema (id_empleado,nombre_usuario,password_hash,email_institucional,activo,requiere_cambio_password)
  VALUES (NULL,'checkin','$2a$10$demo_hash_checkin','checkin@aurora.aero',1,0);
INSERT INTO usuarios_sistema (id_empleado,nombre_usuario,password_hash,email_institucional,activo,requiere_cambio_password)
  VALUES (NULL,'cliente','$2a$10$demo_hash_cliente','cliente@aurora.aero',1,0);

-- ─── Programas de vuelo ───────────────────────────────────────
INSERT INTO programas_vuelo (numero_vuelo,id_aerolinea,aeropuerto_origen,aeropuerto_destino,duracion_estimada_minutos,clase_servicio,activo)
  VALUES ('AV450',1,'GUA','BOG',195,'ECONOMICA,EJECUTIVA',1);
INSERT INTO programas_vuelo (numero_vuelo,id_aerolinea,aeropuerto_origen,aeropuerto_destino,duracion_estimada_minutos,clase_servicio,activo)
  VALUES ('AA822',2,'GUA','MIA',225,'ECONOMICA,EJECUTIVA,PRIMERA_CLASE',1);
INSERT INTO programas_vuelo (numero_vuelo,id_aerolinea,aeropuerto_origen,aeropuerto_destino,duracion_estimada_minutos,clase_servicio,activo)
  VALUES ('CM301',3,'GUA','MEX',150,'ECONOMICA,EJECUTIVA',1);
INSERT INTO programas_vuelo (numero_vuelo,id_aerolinea,aeropuerto_origen,aeropuerto_destino,duracion_estimada_minutos,clase_servicio,activo)
  VALUES ('IB6810',4,'GUA','MAD',690,'ECONOMICA,EJECUTIVA',1);
INSERT INTO programas_vuelo (numero_vuelo,id_aerolinea,aeropuerto_origen,aeropuerto_destino,duracion_estimada_minutos,clase_servicio,activo)
  VALUES ('LA403',5,'GUA','LIM',240,'ECONOMICA,EJECUTIVA',1);

-- ─── Vuelos activos ───────────────────────────────────────────
INSERT INTO vuelos (id_programa,fecha_vuelo,hora_salida_programada,hora_llegada_programada,matricula_avion,plazas_vacias,plazas_ocupadas,estado_vuelo,id_puerta_salida,numero_vuelo,aeropuerto_origen,aeropuerto_destino)
  VALUES (1,DATE '2025-04-15',TIMESTAMP '2025-04-15 09:15:00',TIMESTAMP '2025-04-15 12:30:00','TG-ANA',22,140,'PROGRAMADO',1,'AV450','GUA','BOG');
INSERT INTO vuelos (id_programa,fecha_vuelo,hora_salida_programada,hora_llegada_programada,matricula_avion,plazas_vacias,plazas_ocupadas,estado_vuelo,id_puerta_salida,numero_vuelo,aeropuerto_origen,aeropuerto_destino)
  VALUES (2,DATE '2025-04-15',TIMESTAMP '2025-04-15 18:30:00',TIMESTAMP '2025-04-15 22:15:00','N5548','15,165,'PROGRAMADO',2,'AA822','GUA','MIA');
INSERT INTO vuelos (id_programa,fecha_vuelo,hora_salida_programada,hora_llegada_programada,matricula_avion,plazas_vacias,plazas_ocupadas,estado_vuelo,id_puerta_salida,numero_vuelo,aeropuerto_origen,aeropuerto_destino)
  VALUES (3,DATE '2025-04-15',TIMESTAMP '2025-04-15 07:00:00',TIMESTAMP '2025-04-15 09:30:00','HP-1533',35,145,'EN_VUELO',3,'CM301','GUA','MEX');
INSERT INTO vuelos (id_programa,fecha_vuelo,hora_salida_programada,hora_llegada_programada,matricula_avion,plazas_vacias,plazas_ocupadas,estado_vuelo,id_puerta_salida,numero_vuelo,aeropuerto_origen,aeropuerto_destino)
  VALUES (4,DATE '2025-04-16',TIMESTAMP '2025-04-16 22:00:00',TIMESTAMP '2025-04-17 15:30:00','EC-LQP',0,220,'PROGRAMADO',5,'IB6810','GUA','MAD');

-- ─── Hoteles cercanos ─────────────────────────────────────────
INSERT INTO hoteles_cercanos (codigo_aeropuerto,nombre_hotel,categoria,distancia_km,telefono,tarifa_noche_desde,tiene_shuttle,activo)
  VALUES ('GUA','Westin Camino Real Guatemala','5*',3.2,'2368-3000',180,1,1);
INSERT INTO hoteles_cercanos (codigo_aeropuerto,nombre_hotel,categoria,distancia_km,telefono,tarifa_noche_desde,tiene_shuttle,activo)
  VALUES ('GUA','Hilton Guatemala City','5*',4.5,'2420-3000',165,1,1);
INSERT INTO hoteles_cercanos (codigo_aeropuerto,nombre_hotel,categoria,distancia_km,telefono,tarifa_noche_desde,tiene_shuttle,activo)
  VALUES ('GUA','Hotel Casa Santo Domingo','4*',6.0,'7820-1220',120,0,1);
INSERT INTO hoteles_cercanos (codigo_aeropuerto,nombre_hotel,categoria,distancia_km,telefono,tarifa_noche_desde,tiene_shuttle,activo)
  VALUES ('GUA','Radisson Hotel Guatemala','4*',5.1,'2421-7400',140,1,1);

-- ─── Reservas de prueba ───────────────────────────────────────
INSERT INTO reservas (id_vuelo,id_pasajero,codigo_reserva,fecha_reserva,estado_reserva,clase_servicio,numero_asiento,precio_pagado,moneda,checkin_realizado)
  VALUES (1,1,'RES-001001',SYSDATE,'CONFIRMADA','ECONOMICA','15C',285,'USD',0);
INSERT INTO reservas (id_vuelo,id_pasajero,codigo_reserva,fecha_reserva,estado_reserva,clase_servicio,numero_asiento,precio_pagado,moneda,checkin_realizado)
  VALUES (2,2,'RES-001002',SYSDATE,'CONFIRMADA','EJECUTIVA','3A',650,'USD',0);

COMMIT;
SELECT 'Seed data cargado: ' || COUNT(*) || ' tablas con datos' AS resultado
FROM (
  SELECT 'aeropuertos' t FROM aeropuertos WHERE ROWNUM=1 UNION ALL
  SELECT 'aerolineas'  t FROM aerolineas  WHERE ROWNUM=1 UNION ALL
  SELECT 'vuelos'      t FROM vuelos       WHERE ROWNUM=1 UNION ALL
  SELECT 'pasajeros'   t FROM pasajeros    WHERE ROWNUM=1
);
