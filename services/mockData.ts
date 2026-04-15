import type {
  Aeropuerto, PistaAterrizaje, PuertaEmbarque, ModeloAvion, MantenimientoAvion,
  Aerolinea, ProgramaVuelo, TemporadaVuelo, RestriccionVuelo,
  Vuelo, IncidenteVuelo, RetrasoVuelo, CancelacionVuelo, CombustibleVuelo, EscalaTecnica,
  Tripulante, TripulacionCertificacion, TripulacionDisponibilidad,
  Pasajero, PerfilViajero, Reserva, Factura, Promocion,
  CheckinDigital, ControlAbordaje, Incidente, ProhibicionVuelo, EmergenciaMedica,
  SeguridadControl, VisitaSeguridad, ObjetoPerdido, Concesion, Venta, SalonVip, Estacionamiento,
  HotelCercano, QuejaSugerencia, ProgramaLealtad,
  Empleado, Departamento, Asistencia, Vacacion, Evaluacion, Capacitacion,
  Presupuesto, Ingreso, Gasto, Proveedor, OrdenCompra, CuentaBancaria,
  Menor, Mascota, EnvioCarga, Manifiesto, BodegaCarga,
  Sensor, AlertaTecnica, Pieza, OrdenMantenimiento,
  SlotAeropuerto, RetrasoTiempoReal, TanqueCombustible, PedidoCombustible,
  GestionResiduo, HuellaCarbonoVuelo, UsuarioSistema, RolSistema, IncidenteSeguridad,
  CampanaMarketing, SegmentoCliente, Contrato, Normativa,
  RutaTransporte, VehiculoTransporte, ChoferTransporte, ReservaTransporte,
  PlanEmergencia, EquipoEmergencia, ActivacionEmergencia, ReporteOaci, CertificacionInternacional
} from '@/types';

// ── MÓDULO 1 ──────────────────────────────────────────────
export const AEROPUERTOS: Aeropuerto[] = [
  { codigo_aeropuerto: 'GUA', nombre: 'Aeropuerto Internacional La Aurora', ciudad: 'Ciudad de Guatemala', pais: 'Guatemala', region: 'Centroamérica', continente: 'América', huso_horario: 'UTC-6', latitud: 14.5833, longitud: -90.5275, elevacion_metros: 1503, terminales: 1, puertas_abordaje: 14, activo: 1 },
  { codigo_aeropuerto: 'FRS', nombre: 'Aeropuerto Internacional Mundo Maya', ciudad: 'Flores', pais: 'Guatemala', region: 'Centroamérica', continente: 'América', huso_horario: 'UTC-6', latitud: 16.9138, longitud: -89.8664, elevacion_metros: 123, terminales: 1, puertas_abordaje: 4, activo: 1 },
  { codigo_aeropuerto: 'MCR', nombre: 'Aeropuerto de Puerto Barrios', ciudad: 'Puerto Barrios', pais: 'Guatemala', region: 'Centroamérica', continente: 'América', huso_horario: 'UTC-6', latitud: 15.7308, longitud: -88.5836, elevacion_metros: 3, terminales: 1, puertas_abordaje: 2, activo: 1 },
];
export const PISTAS: PistaAterrizaje[] = [
  { id_pista: 1, codigo_aeropuerto: 'GUA', numero_pista: '01/19', longitud_metros: 2987, anchura_metros: 45, superficie: 'ASFALTO', iluminacion_nocturna: 1, sistema_ils: 1, activo: 1 },
  { id_pista: 2, codigo_aeropuerto: 'GUA', numero_pista: '02/20', longitud_metros: 1800, anchura_metros: 30, superficie: 'CONCRETO', iluminacion_nocturna: 1, sistema_ils: 0, activo: 1 },
  { id_pista: 3, codigo_aeropuerto: 'FRS', numero_pista: '09/27', longitud_metros: 2400, anchura_metros: 45, superficie: 'ASFALTO', iluminacion_nocturna: 1, sistema_ils: 0, activo: 1 },
];
export const PUERTAS: PuertaEmbarque[] = [
  { id_puerta: 1, codigo_aeropuerto: 'GUA', numero_puerta: 'A1', terminal: 'A', tipo_puerta: 'INTERNACIONAL', capacidad_maxima: 200, tiene_pasarela: 1, activo: 1 },
  { id_puerta: 2, codigo_aeropuerto: 'GUA', numero_puerta: 'A2', terminal: 'A', tipo_puerta: 'INTERNACIONAL', capacidad_maxima: 180, tiene_pasarela: 1, activo: 1 },
  { id_puerta: 3, codigo_aeropuerto: 'GUA', numero_puerta: 'B5', terminal: 'B', tipo_puerta: 'NACIONAL', capacidad_maxima: 120, tiene_pasarela: 0, activo: 1 },
  { id_puerta: 4, codigo_aeropuerto: 'GUA', numero_puerta: 'B12', terminal: 'B', tipo_puerta: 'NACIONAL', capacidad_maxima: 100, tiene_pasarela: 0, activo: 1 },
  { id_puerta: 5, codigo_aeropuerto: 'GUA', numero_puerta: 'C3', terminal: 'C', tipo_puerta: 'MIXTA', capacidad_maxima: 150, tiene_pasarela: 1, activo: 1 },
];
// ── MÓDULO 2 ──────────────────────────────────────────────
export const MODELOS_AVIONES: ModeloAvion[] = [
  { id_modelo: 1, nombre_modelo: 'Boeing 737-800', fabricante: 'Boeing', capacidad_pasajeros: 162, capacidad_carga_kg: 15000, autonomia_km: 5765, velocidad_crucero_kmh: 842, tripulacion_minima: 6, activo: 1 },
  { id_modelo: 2, nombre_modelo: 'Airbus A320neo', fabricante: 'Airbus', capacidad_pasajeros: 165, capacidad_carga_kg: 15000, autonomia_km: 6300, velocidad_crucero_kmh: 833, tripulacion_minima: 6, activo: 1 },
  { id_modelo: 3, nombre_modelo: 'Boeing 767-300ER', fabricante: 'Boeing', capacidad_pasajeros: 269, capacidad_carga_kg: 38000, autonomia_km: 11093, velocidad_crucero_kmh: 851, tripulacion_minima: 10, activo: 1 },
  { id_modelo: 4, nombre_modelo: 'ATR 72-600', fabricante: 'ATR', capacidad_pasajeros: 70, capacidad_carga_kg: 8000, autonomia_km: 1528, velocidad_crucero_kmh: 510, tripulacion_minima: 4, activo: 1 },
];
export const MANTENIMIENTOS_AVION: MantenimientoAvion[] = [
  { id_mantenimiento: 1, matricula_avion: 'TG-ANA', id_modelo: 1, fecha_mantenimiento: '2024-05-10', tipo_mantenimiento: 'PREVENTIVO', descripcion: 'Revisión 6,000 horas – sistemas hidráulicos', horas_vuelo_actuales: 6020, proximo_mantenimiento: '2024-11-10', costo: 45000, taller: 'Hangar 3 – GUA', tecnico_responsable: 'Roberto Pérez' },
  { id_mantenimiento: 2, matricula_avion: 'TG-BOB', id_modelo: 2, fecha_mantenimiento: '2024-04-22', tipo_mantenimiento: 'CORRECTIVO', descripcion: 'Reemplazo sensor motor izquierdo', horas_vuelo_actuales: 8340, proximo_mantenimiento: '2024-10-22', costo: 12800, taller: 'Hangar 1 – GUA', tecnico_responsable: 'Diego Morales' },
  { id_mantenimiento: 3, matricula_avion: 'TG-CAR', id_modelo: 1, fecha_mantenimiento: '2024-03-15', tipo_mantenimiento: 'MAYOR', descripcion: 'Revisión C-Check completa – estructura', horas_vuelo_actuales: 24000, proximo_mantenimiento: '2025-03-15', costo: 185000, taller: 'Mexicana MRO', tecnico_responsable: 'Carlos Gómez' },
];
// ── MÓDULO 3 ──────────────────────────────────────────────
export const AEROLINEAS: Aerolinea[] = [
  { id_aerolinea: 1, nombre_aerolinea: 'Avianca Guatemala', codigo_iata: 'AV', codigo_oaci: 'AVA', pais_origen: 'Colombia', flota_total: 12, destinos_totales: 18, alianza: 'STAR_ALLIANCE', activo: 1 },
  { id_aerolinea: 2, nombre_aerolinea: 'American Airlines', codigo_iata: 'AA', codigo_oaci: 'AAL', pais_origen: 'Estados Unidos', flota_total: 850, destinos_totales: 350, alianza: 'ONEWORLD', activo: 1 },
  { id_aerolinea: 3, nombre_aerolinea: 'Iberia', codigo_iata: 'IB', codigo_oaci: 'IBE', pais_origen: 'España', flota_total: 95, destinos_totales: 135, alianza: 'ONEWORLD', activo: 1 },
  { id_aerolinea: 4, nombre_aerolinea: 'LATAM Airlines', codigo_iata: 'LA', codigo_oaci: 'LAN', pais_origen: 'Chile', flota_total: 130, destinos_totales: 145, alianza: 'NINGUNA', activo: 1 },
  { id_aerolinea: 5, nombre_aerolinea: 'Copa Airlines', codigo_iata: 'CM', codigo_oaci: 'CMP', pais_origen: 'Panamá', flota_total: 85, destinos_totales: 80, alianza: 'STAR_ALLIANCE', activo: 1 },
];
// ── MÓDULO 4 ──────────────────────────────────────────────
export const PROGRAMAS_VUELO: ProgramaVuelo[] = [
  { id_programa: 1, numero_vuelo: 'AV450',  id_aerolinea: 1, aeropuerto_origen: 'GUA', aeropuerto_destino: 'BOG', tipo_vuelo: 'INTERNACIONAL', duracion_estimada_minutos: 195, distancia_km: 1820, clase_servicio: 'MIXTA', activo: 1 },
  { id_programa: 2, numero_vuelo: 'AA1234', id_aerolinea: 2, aeropuerto_origen: 'MIA', aeropuerto_destino: 'GUA', tipo_vuelo: 'INTERNACIONAL', duracion_estimada_minutos: 170, distancia_km: 1742, clase_servicio: 'MIXTA', activo: 1 },
  { id_programa: 3, numero_vuelo: 'IB6341', id_aerolinea: 3, aeropuerto_origen: 'GUA', aeropuerto_destino: 'MAD', tipo_vuelo: 'INTERNACIONAL', duracion_estimada_minutos: 800, distancia_km: 9020, clase_servicio: 'MIXTA', activo: 1 },
  { id_programa: 4, numero_vuelo: 'LA2801', id_aerolinea: 4, aeropuerto_origen: 'GUA', aeropuerto_destino: 'LIM', tipo_vuelo: 'INTERNACIONAL', duracion_estimada_minutos: 285, distancia_km: 2820, clase_servicio: 'MIXTA', activo: 1 },
  { id_programa: 5, numero_vuelo: 'CM201',  id_aerolinea: 5, aeropuerto_origen: 'GUA', aeropuerto_destino: 'PTY', tipo_vuelo: 'INTERNACIONAL', duracion_estimada_minutos: 120, distancia_km: 1180, clase_servicio: 'ECONOMICA', activo: 1 },
];
export const TEMPORADAS: TemporadaVuelo[] = [
  { id_temporada: 1, nombre_temporada: 'Semana Santa 2024', fecha_inicio: '2024-03-25', fecha_fin: '2024-04-01', factor_demanda: 1.8, activa: 0 },
  { id_temporada: 2, nombre_temporada: 'Temporada Alta Verano', fecha_inicio: '2024-06-15', fecha_fin: '2024-08-31', factor_demanda: 1.5, activa: 1 },
  { id_temporada: 3, nombre_temporada: 'Navidad y Fin de Año', fecha_inicio: '2024-12-20', fecha_fin: '2025-01-05', factor_demanda: 2.0, activa: 0 },
];
export const RESTRICCIONES_VUELO: RestriccionVuelo[] = [
  { id_restriccion: 1, id_programa: 3, tipo_restriccion: 'CLIMATICA', descripcion: 'Suspensión por tormenta tropical en Atlántico', fecha_inicio: '2024-06-01', fecha_fin: '2024-06-05', activa: 0 },
  { id_restriccion: 2, id_programa: 1, tipo_restriccion: 'TECNICA', descripcion: 'Revisión programada aeronave asignada', fecha_inicio: '2024-07-15', fecha_fin: '2024-07-16', activa: 1 },
];
// ── MÓDULO 5 ──────────────────────────────────────────────
export const VUELOS: Vuelo[] = [
  { id_vuelo: 1, id_programa: 1, fecha_vuelo: '2024-05-15', hora_salida_programada: '2024-05-15T09:15:00', hora_llegada_programada: '2024-05-15T12:30:00', matricula_avion: 'TG-ANA', plazas_vacias: 22, plazas_ocupadas: 140, estado_vuelo: 'EN_VUELO',   id_puerta_salida: 5, numero_vuelo: 'AV450', aeropuerto_origen: 'GUA', aeropuerto_destino: 'BOG' },
  { id_vuelo: 2, id_programa: 3, fecha_vuelo: '2024-05-15', hora_salida_programada: '2024-05-15T18:30:00', hora_llegada_programada: '2024-05-16T08:45:00', matricula_avion: 'TG-BOB', plazas_vacias: 18, plazas_ocupadas: 144, estado_vuelo: 'PROGRAMADO', id_puerta_salida: 1, numero_vuelo: 'IB6341', aeropuerto_origen: 'GUA', aeropuerto_destino: 'MAD' },
  { id_vuelo: 3, id_programa: 2, fecha_vuelo: '2024-05-15', hora_salida_programada: '2024-05-15T06:00:00', hora_llegada_programada: '2024-05-15T09:45:00', hora_llegada_real: '2024-05-15T09:52:00', matricula_avion: 'TG-CAR', plazas_vacias: 5, plazas_ocupadas: 157, estado_vuelo: 'ATERRIZADO', id_puerta_salida: 2, numero_vuelo: 'AA1234', aeropuerto_origen: 'MIA', aeropuerto_destino: 'GUA' },
  { id_vuelo: 4, id_programa: 4, fecha_vuelo: '2024-05-15', hora_salida_programada: '2024-05-15T14:00:00', hora_llegada_programada: '2024-05-15T17:15:00', matricula_avion: 'TG-ANA', plazas_vacias: 50, plazas_ocupadas: 112, estado_vuelo: 'DEMORADO',   id_puerta_salida: 3, numero_vuelo: 'LA2801', aeropuerto_origen: 'GUA', aeropuerto_destino: 'LIM' },
  { id_vuelo: 5, id_programa: 5, fecha_vuelo: '2024-05-15', hora_salida_programada: '2024-05-15T11:00:00', hora_llegada_programada: '2024-05-15T13:30:00', matricula_avion: 'TG-BOB', plazas_vacias: 162, plazas_ocupadas: 0,   estado_vuelo: 'CANCELADO', id_puerta_salida: undefined, numero_vuelo: 'CM201', aeropuerto_origen: 'GUA', aeropuerto_destino: 'PTY' },
];
export const INCIDENTES_VUELO: IncidenteVuelo[] = [
  { id_incidente_vuelo: 1, id_vuelo: 4, fecha_incidente: '2024-05-15T13:45:00', tipo_incidente: 'TECNICO', descripcion: 'Falla en sistema de presurización – retorno a tierra', gravedad: 'ALTA', acciones_tomadas: 'Aterrizaje de emergencia, pasajeros desembarcados', reportado_por: 'Cmte. García' },
  { id_incidente_vuelo: 2, id_vuelo: 3, fecha_incidente: '2024-05-15T08:20:00', tipo_incidente: 'MEDICO', descripcion: 'Pasajero con dificultad respiratoria en vuelo', gravedad: 'MEDIA', acciones_tomadas: 'Atención médica a bordo, traslado al hospital en destino', reportado_por: 'Sobrecargo López' },
];
export const RETRASOS: RetrasoVuelo[] = [
  { id_retraso: 1, id_vuelo: 4, minutos_retraso: 85, tipo_retraso: 'TECNICO', causa: 'Revisión sistema hidráulico antes de despegue', responsable: 'Mantenimiento', compensacion_pasajeros: 1 },
  { id_retraso: 2, id_vuelo: 2, minutos_retraso: 25, tipo_retraso: 'OPERACIONAL', causa: 'Espera de carga tardía', responsable: 'Operaciones Carga', compensacion_pasajeros: 0 },
];
export const CANCELACIONES: CancelacionVuelo[] = [
  { id_cancelacion: 1, id_vuelo: 5, fecha_cancelacion: '2024-05-15T09:00:00', motivo_principal: 'Falla técnica aeronave', motivo_detallado: 'Motor principal requiere revisión no programada', notificado_a_pasajeros: 1, pasajeros_reubicados: 0, costo_compensacion: 24500 },
];
export const COMBUSTIBLES: CombustibleVuelo[] = [
  { id_combustible: 1, id_vuelo: 1, combustible_planeado_litros: 18500, combustible_real_litros: 18780, tipo_combustible: 'JET-A1', proveedor: 'AviCombustibles SA', costo_total: 28900 },
  { id_combustible: 2, id_vuelo: 2, combustible_planeado_litros: 52000, combustible_real_litros: 51200, tipo_combustible: 'JET-A1', proveedor: 'AviCombustibles SA', costo_total: 79360 },
];
export const ESCALAS: EscalaTecnica[] = [
  { id_escala: 1, id_vuelo: 4, aeropuerto_escala: 'PTY', numero_orden: 1, hora_llegada: '2024-05-15T15:30:00', hora_despegue: '2024-05-15T16:15:00', tiempo_escala_minutos: 45, motivo_escala: 'COMBUSTIBLE' },
];
// ── MÓDULO 6 ──────────────────────────────────────────────
export const TRIPULANTES: Tripulante[] = [
  { id_tripulante: 1, nombres: 'Jorge', apellidos: 'García Méndez', tipo_tripulante: 'PILOTO', licencia: 'ATPL-GT-0001', fecha_vencimiento_licencia: '2025-03-15', horas_vuelo_acumuladas: 12450, activo: 1 },
  { id_tripulante: 2, nombres: 'Ana', apellidos: 'Fuentes López', tipo_tripulante: 'COPILOTO', licencia: 'ATPL-GT-0012', fecha_vencimiento_licencia: '2025-06-20', horas_vuelo_acumuladas: 6800, activo: 1 },
  { id_tripulante: 3, nombres: 'Marco', apellidos: 'Solís Herrera', tipo_tripulante: 'SOBRECARGO', licencia: 'CAB-GT-0045', fecha_vencimiento_licencia: '2024-12-01', horas_vuelo_acumuladas: 4200, activo: 1 },
  { id_tripulante: 4, nombres: 'Luisa', apellidos: 'Ramírez Cruz', tipo_tripulante: 'AUXILIAR', licencia: 'AUX-GT-0088', fecha_vencimiento_licencia: '2025-02-28', horas_vuelo_acumuladas: 1800, activo: 1 },
];
export const CERTIFICACIONES_TRIPULACION: TripulacionCertificacion[] = [
  { id_certificacion: 1, id_tripulante: 1, tipo_certificacion: 'Habilitación Boeing 737', fecha_obtencion: '2019-05-10', fecha_vencimiento: '2025-05-10', entidad_certificadora: 'DGAC Guatemala', activa: 1 },
  { id_certificacion: 2, id_tripulante: 1, tipo_certificacion: 'Habilitación Airbus A320', fecha_obtencion: '2021-08-15', fecha_vencimiento: '2025-08-15', entidad_certificadora: 'DGAC Guatemala', activa: 1 },
  { id_certificacion: 3, id_tripulante: 2, tipo_certificacion: 'Habilitación Boeing 737', fecha_obtencion: '2022-03-01', fecha_vencimiento: '2026-03-01', entidad_certificadora: 'DGAC Guatemala', activa: 1 },
];
export const DISPONIBILIDADES: TripulacionDisponibilidad[] = [
  { id_disponibilidad: 1, id_tripulante: 1, fecha_inicio: '2024-05-15', fecha_fin: '2024-05-22', horas_maximas_diarias: 10, disponible: 1, observaciones: 'Semana activa' },
  { id_disponibilidad: 2, id_tripulante: 2, fecha_inicio: '2024-05-18', fecha_fin: '2024-05-25', horas_maximas_diarias: 10, disponible: 1 },
  { id_disponibilidad: 3, id_tripulante: 3, fecha_inicio: '2024-05-20', fecha_fin: '2024-05-27', horas_maximas_diarias: 8, disponible: 0, observaciones: 'Vacaciones pendientes de aprobación' },
];
// ── MÓDULO 7 ──────────────────────────────────────────────
export const PASAJEROS: Pasajero[] = [
  { id_pasajero: 1, nombres: 'María', apellidos: 'González López', tipo_documento: 'PASAPORTE', numero_documento: 'A1234567', nacionalidad: 'Guatemala', fecha_nacimiento: '1985-03-12', genero: 'F', telefono: '5555-1234', email: 'm.gonzalez@email.com', ciudad_residencia: 'Guatemala', pais_residencia: 'Guatemala' },
  { id_pasajero: 2, nombres: 'Carlos', apellidos: 'Rodríguez Meza', tipo_documento: 'DPI', numero_documento: '2890123456101', nacionalidad: 'Guatemala', fecha_nacimiento: '1990-07-25', genero: 'M', telefono: '5555-5678', email: 'c.rodriguez@email.com', ciudad_residencia: 'Guatemala', pais_residencia: 'Guatemala' },
  { id_pasajero: 3, nombres: 'Elena', apellidos: 'Castro Vidal', tipo_documento: 'PASAPORTE', numero_documento: 'B9876543', nacionalidad: 'España', fecha_nacimiento: '1978-11-05', genero: 'F', telefono: '+34 612 345 678', email: 'e.castro@email.es', ciudad_residencia: 'Madrid', pais_residencia: 'España' },
];
export const PERFILES_VIAJERO: PerfilViajero[] = [
  { id_perfil: 1, id_pasajero: 1, tipo_perfil: 'FRECUENTE', numero_programa: 'AV-1234567', puntos_acumulados: 45800, categoria: 'ORO' },
  { id_perfil: 2, id_pasajero: 2, tipo_perfil: 'CORPORATIVO', numero_programa: 'AA-7654321', puntos_acumulados: 12400, categoria: 'PLATA' },
];
// ── MÓDULO 8 ──────────────────────────────────────────────
export const RESERVAS: Reserva[] = [
  { id_reserva: 1, id_vuelo: 1, id_pasajero: 1, codigo_reserva: 'GUA-AV-001254', estado_reserva: 'ABORDADO',  precio_pagado: 480,  moneda: 'USD', numero_asiento: '12A', clase_servicio: 'EJECUTIVA', checkin_realizado: 1, pasajero_nombre: 'María González', numero_vuelo: 'AV450' },
  { id_reserva: 2, id_vuelo: 2, id_pasajero: 2, codigo_reserva: 'GUA-IB-002108', estado_reserva: 'CHECK_IN',  precio_pagado: 820,  moneda: 'USD', numero_asiento: '24C', clase_servicio: 'ECONOMICA', checkin_realizado: 1, pasajero_nombre: 'Carlos Rodríguez', numero_vuelo: 'IB6341' },
  { id_reserva: 3, id_vuelo: 3, id_pasajero: 3, codigo_reserva: 'MIA-AA-000823', estado_reserva: 'CONFIRMADA',precio_pagado: 650,  moneda: 'USD', numero_asiento: '5F',  clase_servicio: 'PRIMERA_CLASE', checkin_realizado: 0, pasajero_nombre: 'Elena Castro', numero_vuelo: 'AA1234' },
];
export const FACTURAS_DATA: Factura[] = [
  { id_factura: 1, id_reserva: 1, numero_factura: 'FACT-2024-00125', fecha_emision: '2024-04-10', subtotal: 426.55, impuestos: 53.45, total: 480.00, moneda: 'USD' },
  { id_factura: 2, id_reserva: 2, numero_factura: 'FACT-2024-00201', fecha_emision: '2024-04-22', subtotal: 731.25, impuestos: 88.75, total: 820.00, moneda: 'USD' },
];
export const PROMOCIONES_DATA: Promocion[] = [
  { id_promocion: 1, codigo_promocion: 'PROMO20GT', nombre_promocion: '20% Centroamérica Junio', tipo_descuento: 'PORCENTAJE', valor_descuento: 20, fecha_inicio: '2024-06-01', fecha_fin: '2024-06-30', uso_maximo: 500, usos_actuales: 127, activa: 1 },
  { id_promocion: 2, codigo_promocion: 'FLASH50',   nombre_promocion: 'Flash 48h – $50 OFF',    tipo_descuento: 'MONTO_FIJO',   valor_descuento: 50, fecha_inicio: '2024-05-15', fecha_fin: '2024-05-17', uso_maximo: 200, usos_actuales: 200, activa: 0 },
];
// ── MÓDULO 9 ──────────────────────────────────────────────
export const CHECKINS: CheckinDigital[] = [
  { id_checkin: 1, id_reserva: 1, fecha_checkin: '2024-05-15T07:30:00', dispositivo: 'iPhone 15', pase_abordaje_generado: 1, enviado_email: 1, enviado_sms: 1 },
  { id_checkin: 2, id_reserva: 2, fecha_checkin: '2024-05-15T16:00:00', dispositivo: 'Android', pase_abordaje_generado: 1, enviado_email: 1, enviado_sms: 0 },
];
export const CONTROLES_ABORDAJE: ControlAbordaje[] = [
  { id_control_abordaje: 1, id_vuelo: 1, id_reserva: 1, hora_abordaje: '2024-05-15T08:50:00', estado: 'ABORDADO' },
  { id_control_abordaje: 2, id_vuelo: 2, id_reserva: 2, estado: 'NO_ABORDADO', observaciones: 'Pasajero no se presentó – puerta cerrada' },
];
// ── MÓDULO 10 ──────────────────────────────────────────────
export const INCIDENTES: Incidente[] = [
  { id_incidente: 1, id_pasajero: 2, fecha_incidente: '2024-05-14', tipo_incidente: 'SEGURIDAD', nivel_gravedad: 'MEDIO', descripcion: 'Pasajero intentó llevar objeto no permitido en carry-on', estado: 'RESUELTO', oficial_a_cargo: 'Agente Morales' },
  { id_incidente: 2, id_vuelo: 1, fecha_incidente: '2024-05-15', tipo_incidente: 'EMERGENCIA_MEDICA', nivel_gravedad: 'ALTO', descripcion: 'Pasajero con crisis alérgica grave durante abordaje', estado: 'ACTIVO', oficial_a_cargo: 'Dr. Fuentes' },
];
export const PROHIBICIONES: ProhibicionVuelo[] = [
  { id_prohibicion: 1, id_pasajero: 2, fecha_inicio: '2024-05-01', fecha_fin: '2024-07-31', motivo: 'Comportamiento disruptivo en vuelo previo', activa: 1 },
];
export const EMERGENCIAS_MEDICAS: EmergenciaMedica[] = [
  { id_emergencia: 1, id_pasajero: 1, id_vuelo: 3, fecha_emergencia: '2024-05-15T08:20:00', tipo_emergencia: 'Crisis respiratoria', diagnostico_inicial: 'Posible asma aguda', tratamiento: 'Nebulización a bordo', requiere_hospitalizacion: 0 },
];
// ── MÓDULO 11 ──────────────────────────────────────────────
export const CONTROLES_SEG: SeguridadControl[] = [
  { id_control: 1, codigo_aeropuerto: 'GUA', fecha_control: '2024-05-15', tipo_control: 'RAYOS_X', numero_pasajeros_revisados: 1842, numero_incidencias: 7, supervisor: 'Agente Morales' },
  { id_control: 2, codigo_aeropuerto: 'GUA', fecha_control: '2024-05-15', tipo_control: 'CANES', numero_pasajeros_revisados: 420, numero_incidencias: 0, supervisor: 'K9 Unidad 3' },
];
export const VISITAS_SEG: VisitaSeguridad[] = [
  { id_visita: 1, codigo_aeropuerto: 'GUA', fecha_visita: '2024-05-15', nombre_visitante: 'Ing. Pedro Alvarado', empresa: 'TechSystems SA', motivo_visita: 'Revisión equipos de rayos X', hora_entrada: '09:00', hora_salida: '11:30' },
];
// ── MÓDULO 12 ──────────────────────────────────────────────
export const OBJETOS_PERDIDOS: ObjetoPerdido[] = [
  { id_objeto: 1, descripcion: 'Maleta rígida negra – ruedas dañadas', categoria_objeto: 'Equipaje', fecha_reporte: '2024-05-14', lugar_encontrado: 'VUELO', estado: 'EN_PROCESO', valor_estimado: 150, encontrado_por: 'Tripulación AV450' },
  { id_objeto: 2, descripcion: 'iPhone 14 Pro color negro, funda azul', categoria_objeto: 'Electrónico', fecha_reporte: '2024-05-15', lugar_encontrado: 'SALA_ESPERA', estado: 'ENCONTRADO', valor_estimado: 800, encontrado_por: 'Personal limpieza' },
  { id_objeto: 3, descripcion: 'Cartera marrón con documentos', categoria_objeto: 'Documentos', fecha_reporte: '2024-05-13', lugar_encontrado: 'AEROPUERTO', estado: 'ENTREGADO', valor_estimado: 50, encontrado_por: 'Agente seguridad' },
];
// ── MÓDULO 13 ──────────────────────────────────────────────
export const CONCESIONES: Concesion[] = [
  { id_concesion: 1, codigo_aeropuerto: 'GUA', nombre_comercial: 'Café Tostado GT', tipo_negocio: 'RESTAURANTE', empresa: 'Grupo Café SA', canon_mensual: 12500, ubicacion_terminal: 'Terminal A – Nivel 2', activo: 1 },
  { id_concesion: 2, codigo_aeropuerto: 'GUA', nombre_comercial: 'Tienda Libre Impuestos', tipo_negocio: 'DUTY_FREE', empresa: 'DutyFree Americas', canon_mensual: 45000, ubicacion_terminal: 'Terminal Internacional', activo: 1 },
  { id_concesion: 3, codigo_aeropuerto: 'GUA', nombre_comercial: 'Artesanías Maya', tipo_negocio: 'TIENDA', empresa: 'ArteMaya SRL', canon_mensual: 8000, ubicacion_terminal: 'Terminal B – Salidas', activo: 1 },
];
export const VENTAS: Venta[] = [
  { id_venta: 1, id_concesion: 1, fecha_venta: '2024-05-15T08:30:00', tipo_cliente: 'PASAJERO', subtotal: 45.00, impuestos: 5.85, total: 50.85, metodo_pago: 'TARJETA' },
  { id_venta: 2, id_concesion: 2, fecha_venta: '2024-05-15T09:15:00', tipo_cliente: 'PASAJERO', subtotal: 220.00, impuestos: 0, total: 220.00, metodo_pago: 'EFECTIVO' },
];
export const SALONES_VIP: SalonVip[] = [
  { id_salon: 1, codigo_aeropuerto: 'GUA', nombre_salon: 'Salón Quetzal Premium', ubicacion: 'Terminal Internacional – Piso 2', capacidad: 80, horario_apertura: '05:00', horario_cierre: '23:00', activo: 1 },
  { id_salon: 2, codigo_aeropuerto: 'GUA', nombre_salon: 'Salón Ejecutivo La Aurora', ubicacion: 'Terminal Nacional – Piso 1', capacidad: 45, horario_apertura: '06:00', horario_cierre: '22:00', activo: 1 },
];
export const ESTACIONAMIENTOS: Estacionamiento[] = [
  { id_estacionamiento: 1, codigo_aeropuerto: 'GUA', numero_espacio: 'A-001', tipo_espacio: 'AUTOMOVIL', tarifa_por_hora: 15, tarifa_diaria: 120, disponible: 0 },
  { id_estacionamiento: 2, codigo_aeropuerto: 'GUA', numero_espacio: 'A-002', tipo_espacio: 'AUTOMOVIL', tarifa_por_hora: 15, tarifa_diaria: 120, disponible: 1 },
  { id_estacionamiento: 3, codigo_aeropuerto: 'GUA', numero_espacio: 'D-001', tipo_espacio: 'DISCAPACITADO', tarifa_por_hora: 10, tarifa_diaria: 80, disponible: 1 },
  { id_estacionamiento: 4, codigo_aeropuerto: 'GUA', numero_espacio: 'E-001', tipo_espacio: 'ELECTRICO', tarifa_por_hora: 18, tarifa_diaria: 140, disponible: 1 },
];
// ── MÓDULO 14 ──────────────────────────────────────────────
export const HOTELES: HotelCercano[] = [
  { id_hotel: 1, codigo_aeropuerto: 'GUA', nombre_hotel: 'Westin Camino Real Guatemala', categoria: '5*', distancia_km: 3.2, telefono: '2368-3000', tarifa_noche_desde: 180, tiene_shuttle: 1, activo: 1 },
  { id_hotel: 2, codigo_aeropuerto: 'GUA', nombre_hotel: 'Hilton Guatemala City', categoria: '5*', distancia_km: 4.5, telefono: '2420-3000', tarifa_noche_desde: 165, tiene_shuttle: 1, activo: 1 },
  { id_hotel: 3, codigo_aeropuerto: 'GUA', nombre_hotel: 'Hotel Stofella', categoria: '3*', distancia_km: 2.1, telefono: '2410-8000', tarifa_noche_desde: 65, tiene_shuttle: 0, activo: 1 },
];
export const QUEJAS: QuejaSugerencia[] = [
  { id_queja: 1, id_pasajero: 1, tipo_contacto: 'QUEJA',      fecha_contacto: '2024-05-14T14:30:00', descripcion: 'Maleta dañada durante manejo de equipaje', estado: 'EN_PROCESO', area_relacionada: 'Equipaje' },
  { id_queja: 2, id_pasajero: 2, tipo_contacto: 'SUGERENCIA', fecha_contacto: '2024-05-13T09:00:00', descripcion: 'Sería útil tener más cargadores USB en sala de espera', estado: 'RESPONDIDA', area_relacionada: 'Infraestructura' },
  { id_queja: 3, id_pasajero: 3, tipo_contacto: 'FELICITACION', fecha_contacto: '2024-05-12T18:00:00', descripcion: 'Excelente atención del personal de sala VIP', estado: 'ARCHIVADA', area_relacionada: 'Atención al Cliente' },
];
export const PROGRAMAS_LEALTAD: ProgramaLealtad[] = [
  { id_lealtad: 1, id_pasajero: 1, nivel_membresia: 'ORO',    puntos_acumulados: 45800, millas_acumuladas: 82400, activo: 1 },
  { id_lealtad: 2, id_pasajero: 2, nivel_membresia: 'PLATA',  puntos_acumulados: 12400, millas_acumuladas: 23500, activo: 1 },
];
// ── MÓDULO 15 ──────────────────────────────────────────────
export const EMPLEADOS: Empleado[] = [
  { id: 1, codigo: 'EMP-001', nombres: 'Carlos',  apellidos: 'Méndez García',   cargo: 'Jefe de Operaciones',   departamento: 'Operaciones',  tipo_contrato: 'PERMANENTE', salario_base: 12500, fecha_contratacion: '2019-03-15', email: 'c.mendez@aurora.gt',   telefono: '5555-1001', activo: 1 },
  { id: 2, codigo: 'EMP-002', nombres: 'María',   apellidos: 'López Juárez',    cargo: 'Supervisora Seguridad', departamento: 'Seguridad',    tipo_contrato: 'PERMANENTE', salario_base: 10800, fecha_contratacion: '2020-07-01', email: 'm.lopez@aurora.gt',    telefono: '5555-1002', activo: 1 },
  { id: 3, codigo: 'EMP-003', nombres: 'Roberto', apellidos: 'Pérez Estrada',   cargo: 'Técnico Mantenimiento', departamento: 'Mantenimiento',tipo_contrato: 'PERMANENTE', salario_base: 8200,  fecha_contratacion: '2018-11-20', email: 'r.perez@aurora.gt',    telefono: '5555-1003', activo: 1 },
  { id: 4, codigo: 'EMP-004', nombres: 'Ana',     apellidos: 'Hernández Vidal', cargo: 'Agente de Abordaje',   departamento: 'Operaciones',  tipo_contrato: 'TEMPORAL',   salario_base: 6500,  fecha_contratacion: '2023-01-10', email: 'a.hernandez@aurora.gt',telefono: '5555-1004', activo: 1 },
  { id: 5, codigo: 'EMP-005', nombres: 'Luis',    apellidos: 'González Morales',cargo: 'Analista Financiero',  departamento: 'Finanzas',     tipo_contrato: 'PERMANENTE', salario_base: 11000, fecha_contratacion: '2021-05-15', email: 'l.gonzalez@aurora.gt', telefono: '5555-1005', activo: 1 },
  { id: 6, codigo: 'EMP-006', nombres: 'Sofía',   apellidos: 'Ramírez Castro',  cargo: 'Inspectora Aduanas',  departamento: 'Aduanas',      tipo_contrato: 'PERMANENTE', salario_base: 9800,  fecha_contratacion: '2017-08-22', email: 's.ramirez@aurora.gt',  telefono: '5555-1006', activo: 1 },
  { id: 7, codigo: 'EMP-007', nombres: 'Diego',   apellidos: 'Torres Fuentes',  cargo: 'Operador Torre',      departamento: 'Control Aéreo',tipo_contrato: 'PERMANENTE', salario_base: 15200, fecha_contratacion: '2016-04-30', email: 'd.torres@aurora.gt',   telefono: '5555-1007', activo: 0 },
];
export const DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Operaciones',   descripcion: 'Gestión de vuelos y pasajeros',     ubicacion: 'Terminal Principal',     presupuesto: 1200000, gerente: 'Carlos Méndez',  activo: 1 },
  { id: 2, nombre: 'Seguridad',     descripcion: 'Control y vigilancia aeroportuaria',ubicacion: 'Torre Seguridad',        presupuesto: 980000,  gerente: 'María López',    activo: 1 },
  { id: 3, nombre: 'Mantenimiento', descripcion: 'Mantenimiento de instalaciones',    ubicacion: 'Hangar Principal',       presupuesto: 750000,  gerente: 'Roberto Pérez',  activo: 1 },
  { id: 4, nombre: 'Finanzas',      descripcion: 'Gestión financiera y contabilidad', ubicacion: 'Edificio Administrativo',presupuesto: 650000,  gerente: 'Luis González',  activo: 1 },
  { id: 5, nombre: 'Aduanas',       descripcion: 'Control aduanero y migración',      ubicacion: 'Terminal Internacional', presupuesto: 520000,  gerente: 'Sofía Ramírez',  activo: 1 },
  { id: 6, nombre: 'Control Aéreo', descripcion: 'Control de tráfico aéreo',          ubicacion: 'Torre de Control',       presupuesto: 1450000, gerente: 'Diego Torres',   activo: 1 },
];
export const ASISTENCIAS: Asistencia[] = [
  { id_asistencia: 1, id_empleado: 1, fecha: '2024-05-15', hora_entrada: '07:55', hora_salida: '16:10', horas_trabajadas: 8.25, tipo_jornada: 'ORDINARIA' },
  { id_asistencia: 2, id_empleado: 2, fecha: '2024-05-15', hora_entrada: '06:00', hora_salida: '14:05', horas_trabajadas: 8.08, tipo_jornada: 'ORDINARIA' },
  { id_asistencia: 3, id_empleado: 3, fecha: '2024-05-15', hora_entrada: '08:00', hora_salida: '20:30', horas_trabajadas: 12.5, tipo_jornada: 'EXTRA' },
];
export const VACACIONES_DATA: Vacacion[] = [
  { id: 1, empleado: 'Carlos Méndez García',   tipo: 'VACACIONES',  fecha_inicio: '2024-07-01', fecha_fin: '2024-07-15', dias: 15, estado: 'AUTORIZADO', motivo: 'Vacaciones anuales' },
  { id: 2, empleado: 'María López Juárez',     tipo: 'PERMISO',     fecha_inicio: '2024-06-10', fecha_fin: '2024-06-11', dias: 2,  estado: 'AUTORIZADO', motivo: 'Asuntos personales' },
  { id: 3, empleado: 'Roberto Pérez Estrada',  tipo: 'INCAPACIDAD', fecha_inicio: '2024-05-20', fecha_fin: '2024-05-27', dias: 7,  estado: 'AUTORIZADO', motivo: 'Lesión rodilla' },
  { id: 4, empleado: 'Ana Hernández Vidal',    tipo: 'VACACIONES',  fecha_inicio: '2024-08-05', fecha_fin: '2024-08-12', dias: 8,  estado: 'PENDIENTE',  motivo: 'Vacaciones verano' },
];
export const EVALUACIONES_DATA: Evaluacion[] = [
  { id: 1, empleado: 'Carlos Méndez',  evaluador: 'Director General', periodo: '2024-Q1', puntuacion_total: 4.5, productividad: 4.8, calidad: 4.3, asistencia: 4.5, trabajo_equipo: 4.4, fecha: '2024-04-05' },
  { id: 2, empleado: 'María López',    evaluador: 'Carlos Méndez',    periodo: '2024-Q1', puntuacion_total: 4.2, productividad: 4.0, calidad: 4.5, asistencia: 4.8, trabajo_equipo: 3.5, fecha: '2024-04-06' },
  { id: 3, empleado: 'Roberto Pérez',  evaluador: 'Carlos Méndez',    periodo: '2024-Q1', puntuacion_total: 3.8, productividad: 3.5, calidad: 4.0, asistencia: 3.8, trabajo_equipo: 3.9, fecha: '2024-04-07' },
  { id: 4, empleado: 'Ana Hernández',  evaluador: 'Carlos Méndez',    periodo: '2024-Q1', puntuacion_total: 4.7, productividad: 4.9, calidad: 4.6, asistencia: 5.0, trabajo_equipo: 4.3, fecha: '2024-04-08' },
];
export const CAPACITACIONES_DATA: Capacitacion[] = [
  { id: 1, nombre_curso: 'Seguridad Aeroportuaria Nivel 1', tipo: 'SEGURIDAD',       duracion_horas: 40, costo: 3500, proveedor: 'IATA Training',    fecha_inicio: '2024-02-01', fecha_fin: '2024-02-10', activo: 1 },
  { id: 2, nombre_curso: 'Atención al Cliente Avanzada',    tipo: 'ATENCION_CLIENTE', duracion_horas: 16, costo: 1200, proveedor: 'AeroServ',         fecha_inicio: '2024-03-15', fecha_fin: '2024-03-17', activo: 1 },
  { id: 3, nombre_curso: 'Inglés Técnico Aeronáutico',      tipo: 'IDIOMAS',          duracion_horas: 80, costo: 4500, proveedor: 'AeroLanguage',      fecha_inicio: '2024-01-10', fecha_fin: '2024-04-10', activo: 1 },
  { id: 4, nombre_curso: 'Manejo Materiales Peligrosos',    tipo: 'TECNICA',          duracion_horas: 24, costo: 2800, proveedor: 'AviSafe Corp',      fecha_inicio: '2024-04-05', fecha_fin: '2024-04-08', activo: 1 },
];
// ── MÓDULO 16 ──────────────────────────────────────────────
export const PRESUPUESTOS_DATA: Presupuesto[] = [
  { id: 1, anio: 2024, mes: 5, concepto: 'Nómina de Personal',    departamento: 'RRHH',          monto_asignado: 450000, monto_ejecutado: 448200, tipo: 'PERSONAL' },
  { id: 2, anio: 2024, mes: 5, concepto: 'Mantenimiento Pistas',  departamento: 'Mantenimiento', monto_asignado: 120000, monto_ejecutado: 98400,  tipo: 'MANTENIMIENTO' },
  { id: 3, anio: 2024, mes: 5, concepto: 'Servicios Limpieza',    departamento: 'Operaciones',   monto_asignado: 35000,  monto_ejecutado: 35000,  tipo: 'OPERATIVO' },
  { id: 4, anio: 2024, mes: 5, concepto: 'Renovación Equipos TI', departamento: 'Tecnología',    monto_asignado: 200000, monto_ejecutado: 145000, tipo: 'INVERSION' },
];
export const INGRESOS_DATA: Ingreso[] = [
  { id: 1, fecha: '2024-05-15', concepto: 'Tasa Embarque Internacional', tipo: 'TASA_EMBARQUE',  monto: 185000, moneda: 'GTQ', comprobante: 'INI-001254' },
  { id: 2, fecha: '2024-05-15', concepto: 'Ingresos Concesiones Mayo',   tipo: 'CONCESIONES',    monto: 42300,  moneda: 'GTQ', comprobante: 'INI-001255' },
  { id: 3, fecha: '2024-05-14', concepto: 'Estacionamiento Largo Plazo', tipo: 'ESTACIONAMIENTO',monto: 18700,  moneda: 'GTQ', comprobante: 'INI-001253' },
  { id: 4, fecha: '2024-05-13', concepto: 'Publicidad Terminal Norte',   tipo: 'PUBLICIDAD',     monto: 12500,  moneda: 'GTQ', comprobante: 'INI-001252' },
];
export const GASTOS_DATA: Gasto[] = [
  { id: 1, fecha: '2024-05-15', concepto: 'Electricidad Mayo',         tipo: 'SERVICIOS',    departamento: 'Mantenimiento', proveedor: 'EEGSA',            monto: 48200,  moneda: 'GTQ', factura: 'FAC-8821' },
  { id: 2, fecha: '2024-05-14', concepto: 'Combustible vehículos',     tipo: 'SUMINISTROS',  departamento: 'Operaciones',   proveedor: 'AviCombustibles',  monto: 12500,  moneda: 'GTQ', factura: 'FAC-8820' },
  { id: 3, fecha: '2024-05-12', concepto: 'Servicio Seguridad Privada',tipo: 'SEGURIDAD',    departamento: 'Seguridad',     proveedor: 'ProSecure GT',     monto: 35000,  moneda: 'GTQ', factura: 'FAC-8818' },
  { id: 4, fecha: '2024-05-10', concepto: 'Nómina quincenal',          tipo: 'PERSONAL',     departamento: 'RRHH',          proveedor: 'Interno',          monto: 224500, moneda: 'GTQ', factura: 'NOM-0510' },
];
export const PROVEEDORES_DATA: Proveedor[] = [
  { id: 1, nombre: 'AviCombustibles SA', tipo: 'COMBUSTIBLE',  nit: '1234567-8', contacto: 'Pedro Alvarado', telefono: '2345-6789', email: 'p.alvarado@avicomb.gt', calificacion: 4, activo: 1 },
  { id: 2, nombre: 'TechAir Services',   tipo: 'MANTENIMIENTO', nit: '8765432-1', contacto: 'Gloria Herrera', telefono: '3456-7890', email: 'g.herrera@techair.gt',  calificacion: 5, activo: 1 },
  { id: 3, nombre: 'ProSecure GT',       tipo: 'SEGURIDAD',    nit: '5555666-7', contacto: 'Miguel Fuentes', telefono: '4567-8901', email: 'm.fuentes@prosecure.gt',calificacion: 4, activo: 1 },
  { id: 4, nombre: 'AeroTech Solutions', tipo: 'TECNOLOGIA',   nit: '9999111-0', contacto: 'Andrés Castillo',telefono: '6789-0123', email: 'a.castillo@aerotech.gt',calificacion: 5, activo: 1 },
];
export const ORDENES_COMPRA: OrdenCompra[] = [
  { id_orden: 1, id_proveedor: 2, fecha_orden: '2024-05-10', fecha_entrega_estimada: '2024-05-20', estado: 'EN_PROCESO', subtotal: 85000, impuestos: 12750, total: 97750 },
  { id_orden: 2, id_proveedor: 1, fecha_orden: '2024-05-08', fecha_entrega_estimada: '2024-05-15', estado: 'COMPLETADO', subtotal: 45000, impuestos: 6750,  total: 51750 },
];
export const CUENTAS_BANCARIAS: CuentaBancaria[] = [
  { id_cuenta: 1, banco: 'Banco Industrial',   tipo_cuenta: 'MONETARIA', numero_cuenta: '0123-456789-0', moneda: 'GTQ', saldo_actual: 1250000, estado: 'ACTIVA' },
  { id_cuenta: 2, banco: 'Banco de Guatemala', tipo_cuenta: 'INVERSION', numero_cuenta: '9876-543210-1', moneda: 'USD', saldo_actual: 485000,  estado: 'ACTIVA' },
];
// ── MÓDULO 18 ──────────────────────────────────────────────
export const MENORES_DATA: Menor[] = [
  { id: 1, reserva: 'RES-20240001', pasajero: 'Valentina Ruiz', edad: 8,  vuelo: 'IB6341', origen: 'GUA', destino: 'MAD', entrega_origen: 'Jorge Ruiz (Padre)',   tel_origen: '5555-2001', recoge_destino: 'Elena García (Abuela)', tel_destino: '+34 911 234567', estado: 'ABORDADO' },
  { id: 2, reserva: 'RES-20240002', pasajero: 'Mateo Sánchez',  edad: 11, vuelo: 'AV450',  origen: 'GUA', destino: 'BOG', entrega_origen: 'Patricia López (Madre)',tel_origen: '5555-2002', recoge_destino: 'Camilo Sánchez (Padre)',tel_destino: '+57 310 9876543', estado: 'CHECK_IN' },
];
export const MASCOTAS_DATA: Mascota[] = [
  { id: 1, reserva: 'RES-20240010', pasajero: 'Carlos Mendoza', nombre: 'Luna',  tipo: 'PERRO', raza: 'Golden Retriever', peso_kg: 28,  vuelo: 'AV450',  destino: 'BOG', autorizado: 1 },
  { id: 2, reserva: 'RES-20240011', pasajero: 'Ana Fuentes',    nombre: 'Mishi', tipo: 'GATO',  raza: 'Siamés',          peso_kg: 4.5, vuelo: 'IB6341', destino: 'MAD', autorizado: 1 },
];
// ── MÓDULO 19 ──────────────────────────────────────────────
export const ENVIOS_DATA: EnvioCarga[] = [
  { id: 1, codigo: 'CAR-2024-0001', vuelo: 'IB6341', tipo: 'GENERAL',      peso_kg: 350, bultos: 12, contenido: 'Ropa y textiles',     consignador: 'Textiles GT SA',   consignatario: 'Modas Madrid SL',  estado: 'CARGADO',   valor: 45000 },
  { id: 2, codigo: 'CAR-2024-0002', vuelo: 'AV450',  tipo: 'PERECEDERA',  peso_kg: 180, bultos: 6,  contenido: 'Flores frescas',      consignador: 'FloresMaya SA',    consignatario: 'Flores Bogotá',    estado: 'EN_BODEGA', valor: 12000 },
  { id: 3, codigo: 'CAR-2024-0003', vuelo: 'AA1234', tipo: 'VALORES',     peso_kg: 15,  bultos: 2,  contenido: 'Documentos bancarios',consignador: 'Banco Nacional GT', consignatario: 'Bank of America',  estado: 'ADUANA',    valor: 150000 },
  { id: 4, codigo: 'CAR-2024-0004', vuelo: 'IB6341', tipo: 'MEDICAMENTOS',peso_kg: 85,  bultos: 4,  contenido: 'Vacunas refrigeradas',consignador: 'FarmaGT SA',       consignatario: 'Farmacia Ibérica', estado: 'RECIBIDO',  valor: 28000 },
];
export const MANIFIESTOS_DATA: Manifiesto[] = [
  { id: 1, numero: 'MAN-2024-0001', vuelo: 'IB6341', fecha: '2024-05-15', bultos: 42, peso_total: 680,  valor_total: 225000, agente: 'AeroCargo SA',  estado: 'VALIDADO' },
  { id: 2, numero: 'MAN-2024-0002', vuelo: 'AV450',  fecha: '2024-05-15', bultos: 18, peso_total: 290,  valor_total: 85000,  agente: 'LogiAero GT',   estado: 'EMITIDO' },
  { id: 3, numero: 'MAN-2024-0003', vuelo: 'AA1234', fecha: '2024-05-14', bultos: 31, peso_total: 445,  valor_total: 310000, agente: 'TransAir Corp', estado: 'CERRADO' },
];
export const BODEGAS: BodegaCarga[] = [
  { id_bodega: 1, codigo_bodega: 'BOD-GUA-001', nombre_bodega: 'Bodega General Norte',    ubicacion: 'Terminal de Carga – Zona Norte', capacidad_m3: 500, capacidad_kg: 80000, tiene_refrigeracion: 0, activo: 1 },
  { id_bodega: 2, codigo_bodega: 'BOD-GUA-002', nombre_bodega: 'Bodega Refrigerada',      ubicacion: 'Terminal de Carga – Zona Sur',   capacidad_m3: 120, capacidad_kg: 20000, tiene_refrigeracion: 1, activo: 1 },
  { id_bodega: 3, codigo_bodega: 'BOD-GUA-003', nombre_bodega: 'Bodega Valores y Aduana', ubicacion: 'Terminal Internacional – Planta Baja', capacidad_m3: 80, capacidad_kg: 15000, tiene_refrigeracion: 0, activo: 1 },
];
// ── MÓDULO 20 ──────────────────────────────────────────────
export const SENSORES_DATA: Sensor[] = [
  { id: 1, codigo: 'SEN-MOT-001', tipo: 'MOTOR',       modelo_avion: 'Boeing 737-800', ubicacion: 'Motor Izquierdo',     fabricante: 'Honeywell',       activo: 1, ultima_calibracion: '2024-04-01' },
  { id: 2, codigo: 'SEN-TMP-002', tipo: 'TEMPERATURA', modelo_avion: 'Airbus A320',    ubicacion: 'Cabina Pasajeros',    fabricante: 'Sensata',         activo: 1, ultima_calibracion: '2024-03-15' },
  { id: 3, codigo: 'SEN-COM-003', tipo: 'COMBUSTIBLE', modelo_avion: 'Boeing 737-800', ubicacion: 'Depósito Principal', fabricante: 'Parker Hannifin', activo: 1, ultima_calibracion: '2024-04-10' },
  { id: 4, codigo: 'SEN-PRE-004', tipo: 'PRESION',     modelo_avion: 'Airbus A320',    ubicacion: 'Cabina de Presión',  fabricante: 'Meggitt',         activo: 1, ultima_calibracion: '2024-02-28' },
  { id: 5, codigo: 'SEN-VIB-005', tipo: 'VIBRACION',   modelo_avion: 'Boeing 737-800', ubicacion: 'Tren Aterrizaje',    fabricante: 'PCB Piezotronics',activo: 0, ultima_calibracion: '2024-01-20' },
];
export const ALERTAS_DATA: AlertaTecnica[] = [
  { id: 1, sensor: 'SEN-MOT-001', nivel: 'PREVENTIVO',  tipo: 'Temperatura elevada',   descripcion: 'Temperatura de motor supera umbral preventivo', valor_umbral: 620, valor_actual: 628, fecha: '2024-05-15 14:32', atendida: 0 },
  { id: 2, sensor: 'SEN-COM-003', nivel: 'CRITICO',     tipo: 'Nivel combustible bajo',descripcion: 'Nivel por debajo del mínimo operativo',          valor_umbral: 15000, valor_actual: 13200, fecha: '2024-05-14 22:10', atendida: 1 },
  { id: 3, sensor: 'SEN-VIB-005', nivel: 'PREVENTIVO',  tipo: 'Vibración excesiva',    descripcion: 'Vibración tren de aterrizaje supera umbral',    valor_umbral: 2.5, valor_actual: 3.1, fecha: '2024-05-14 18:45', atendida: 0 },
  { id: 4, sensor: 'SEN-PRE-004', nivel: 'INFORMATIVO', tipo: 'Presión cabina',        descripcion: 'Presión dentro de rangos normales – rutinario', valor_umbral: 11.5, valor_actual: 11.3, fecha: '2024-05-15 10:15', atendida: 1 },
];
export const PIEZAS_DATA: Pieza[] = [
  { id: 1, codigo: 'PIE-0001', nombre: 'Filtro Combustible Boeing 737',  modelo: 'Boeing 737-800', stock_actual: 12, stock_minimo: 5,  precio: 4500,  ubicacion: 'Almacén A-12' },
  { id: 2, codigo: 'PIE-0002', nombre: 'Sensor Temperatura Airbus',      modelo: 'Airbus A320',    stock_actual: 3,  stock_minimo: 4,  precio: 8200,  ubicacion: 'Almacén A-08' },
  { id: 3, codigo: 'PIE-0003', nombre: 'Amortiguador Tren Aterrizaje',   modelo: 'Boeing 737-800', stock_actual: 8,  stock_minimo: 2,  precio: 32000, ubicacion: 'Almacén B-03' },
  { id: 4, codigo: 'PIE-0004', nombre: 'Válvula Hidráulica A320',        modelo: 'Airbus A320',    stock_actual: 6,  stock_minimo: 3,  precio: 15800, ubicacion: 'Almacén A-15' },
  { id: 5, codigo: 'PIE-0005', nombre: 'Neumático Principal 737',        modelo: 'Boeing 737-800', stock_actual: 4,  stock_minimo: 6,  precio: 22000, ubicacion: 'Almacén C-01' },
];
export const ORDENES_DATA: OrdenMantenimiento[] = [
  { id: 1, alerta: 'ALR-001', pieza: 'Filtro Combustible', avion: 'TG-ANA', prioridad: 'ALTA',    descripcion: 'Reemplazar filtro por desgaste detectado', tecnico: 'Roberto Pérez', estado: 'EN_PROCESO', fecha_estimada: '2024-05-16', costo_estimado: 4800 },
  { id: 2, alerta: 'ALR-003', pieza: 'Sensor Temperatura', avion: 'TG-BOB', prioridad: 'URGENTE', descripcion: 'Sustitución urgente sensor motor',           tecnico: 'Diego Morales', estado: 'ASIGNADO',   fecha_estimada: '2024-05-15', costo_estimado: 8500 },
  { id: 3, alerta: 'ALR-004', pieza: 'Amortiguador',       avion: 'TG-ANA', prioridad: 'MEDIA',   descripcion: 'Revisión y posible reemplazo amortiguadores',tecnico: 'Carlos Gómez',  estado: 'PENDIENTE',  fecha_estimada: '2024-05-20', costo_estimado: 35000 },
  { id: 4, alerta: 'ALR-002', pieza: 'Neumático Principal',avion: 'TG-CAR', prioridad: 'BAJA',    descripcion: 'Revisión preventiva por horas de vuelo',      tecnico: 'María Estrada', estado: 'COMPLETADO', fecha_estimada: '2024-05-10', costo_estimado: 22000 },
];
// ── MÓDULO 21 ──────────────────────────────────────────────
export const SLOTS: SlotAeropuerto[] = [
  { id_slot: 1, id_aerolinea: 1, fecha_slot: '2024-05-15', tipo_operacion: 'DESPEGUE', estado_slot: 'UTILIZADO', id_vuelo_asignado: 1 },
  { id_slot: 2, id_aerolinea: 3, fecha_slot: '2024-05-15', tipo_operacion: 'DESPEGUE', estado_slot: 'ASIGNADO',  id_vuelo_asignado: 2 },
  { id_slot: 3, id_aerolinea: 2, fecha_slot: '2024-05-15', tipo_operacion: 'ATERRIZAJE',estado_slot: 'UTILIZADO',id_vuelo_asignado: 3 },
  { id_slot: 4, id_aerolinea: 5, fecha_slot: '2024-05-15', tipo_operacion: 'DESPEGUE', estado_slot: 'CANCELADO' },
  { id_slot: 5, id_aerolinea: 1, fecha_slot: '2024-05-16', tipo_operacion: 'DESPEGUE', estado_slot: 'DISPONIBLE' },
];
export const RETRASOS_TR: RetrasoTiempoReal[] = [
  { id_retraso_tiempo_real: 1, id_vuelo: 4, tipo_retraso: 'TECNICO',   causa_especifica: 'Revisión sistema hidráulico previo a despegue', minutos_retraso_actuales: 85, notificado_pasajeros: 1 },
  { id_retraso_tiempo_real: 2, id_vuelo: 2, tipo_retraso: 'OPERACIONAL',causa_especifica: 'Espera documentación carga tardía',             minutos_retraso_actuales: 25, notificado_pasajeros: 0 },
];
// ── MÓDULO 22 ──────────────────────────────────────────────
export const TANQUES: TanqueCombustible[] = [
  { id_tanque: 1, codigo_tanque: 'TNK-GUA-001', nombre_tanque: 'Tanque Principal JET-A1 Norte', tipo_combustible: 'JET_A1', capacidad_litros: 500000, nivel_actual_litros: 385000, porcentaje_llenado: 77, activo: 1 },
  { id_tanque: 2, codigo_tanque: 'TNK-GUA-002', nombre_tanque: 'Tanque Secundario JET-A1 Sur',  tipo_combustible: 'JET_A1', capacidad_litros: 350000, nivel_actual_litros: 290000, porcentaje_llenado: 83, activo: 1 },
  { id_tanque: 3, codigo_tanque: 'TNK-GUA-003', nombre_tanque: 'Tanque AVGAS Regional',        tipo_combustible: 'AVGAS',  capacidad_litros: 50000,  nivel_actual_litros: 12000,  porcentaje_llenado: 24, activo: 1 },
];
export const PEDIDOS_COMB: PedidoCombustible[] = [
  { id_pedido_combustible: 1, numero_pedido: 'PED-2024-0125', id_vuelo: 1, cantidad_solicitada_litros: 18500, estado_pedido: 'COMPLETADO', prioridad: 'NORMAL' },
  { id_pedido_combustible: 2, numero_pedido: 'PED-2024-0126', id_vuelo: 2, cantidad_solicitada_litros: 52000, estado_pedido: 'EN_PROCESO', prioridad: 'NORMAL' },
  { id_pedido_combustible: 3, numero_pedido: 'PED-2024-0127', id_vuelo: 4, cantidad_solicitada_litros: 24000, estado_pedido: 'APROBADO',   prioridad: 'ALTA' },
];
// ── MÓDULO 23 ──────────────────────────────────────────────
export const RESIDUOS: GestionResiduo[] = [
  { id_residuo: 1, fecha_recoleccion: '2024-05-15', tipo_residuo: 'ORGANICO',   cantidad_kg: 420, origen: 'VUELOS',      empresa_recolectora: 'EcoGT SA',    tratamiento: 'COMPOSTAJE', costo_tratamiento: 1250 },
  { id_residuo: 2, fecha_recoleccion: '2024-05-15', tipo_residuo: 'PLASTICO',   cantidad_kg: 180, origen: 'TERMINAL',    empresa_recolectora: 'ReciclaGT',   tratamiento: 'RECICLAJE',  costo_tratamiento: 540 },
  { id_residuo: 3, fecha_recoleccion: '2024-05-15', tipo_residuo: 'PELIGROSO',  cantidad_kg: 45,  origen: 'MANTENIMIENTO',empresa_recolectora: 'HazWaste SA', tratamiento: 'INCINERACION',costo_tratamiento: 2800 },
];
export const HUELLAS_CARBONO: HuellaCarbonoVuelo[] = [
  { id_huella_carbono: 1, id_vuelo: 1, combustible_consumido_litros: 18780, co2_emitido_kg: 47754, co2_por_pasajero_kg: 341.1, distancia_vuelo_km: 1820, categoria_vuelo: 'MEDIO' },
  { id_huella_carbono: 2, id_vuelo: 2, combustible_consumido_litros: 51200, co2_emitido_kg: 130048, co2_por_pasajero_kg: 903.1, distancia_vuelo_km: 9020, categoria_vuelo: 'LARGO' },
];
// ── MÓDULO 24 ──────────────────────────────────────────────
export const USUARIOS: UsuarioSistema[] = [
  { id_usuario_sistema: 1, nombre_usuario: 'admin',    email_institucional: 'admin@aurora.gt',      fecha_creacion: '2020-01-15', bloqueado: 0, activo: 1, intentos_fallidos: 0 },
  { id_usuario_sistema: 2, nombre_usuario: 'c.mendez', email_institucional: 'c.mendez@aurora.gt',    fecha_creacion: '2021-03-01', bloqueado: 0, activo: 1, intentos_fallidos: 0 },
  { id_usuario_sistema: 3, nombre_usuario: 'm.lopez',  email_institucional: 'm.lopez@aurora.gt',     fecha_creacion: '2021-07-15', bloqueado: 0, activo: 1, intentos_fallidos: 1 },
  { id_usuario_sistema: 4, nombre_usuario: 'operador1',email_institucional: 'operador1@aurora.gt',   fecha_creacion: '2023-02-10', bloqueado: 1, activo: 0, intentos_fallidos: 5 },
];
export const ROLES: RolSistema[] = [
  { id_rol_sistema: 1, nombre_rol: 'SUPERADMIN',         descripcion: 'Acceso total al sistema',       nivel_jerarquico: 1, activo: 1 },
  { id_rol_sistema: 2, nombre_rol: 'JEFE_OPERACIONES',   descripcion: 'Gestión de vuelos y operaciones',nivel_jerarquico: 2, activo: 1 },
  { id_rol_sistema: 3, nombre_rol: 'AGENTE_OPERACIONES', descripcion: 'Registro y consulta operativa',  nivel_jerarquico: 3, activo: 1 },
  { id_rol_sistema: 4, nombre_rol: 'FINANZAS',           descripcion: 'Gestión financiera',             nivel_jerarquico: 2, activo: 1 },
  { id_rol_sistema: 5, nombre_rol: 'SEGURIDAD',          descripcion: 'Módulos de seguridad',           nivel_jerarquico: 2, activo: 1 },
];
export const INCIDENTES_SEG: IncidenteSeguridad[] = [
  { id_incidente_seguridad_info: 1, fecha_deteccion: '2024-05-14 23:45:00', tipo_incidente: 'FUERZA_BRUTA',    nivel_gravedad: 'MEDIO', descripcion: '15 intentos fallidos de login desde IP 181.45.22.15', estado: 'RESUELTO' },
  { id_incidente_seguridad_info: 2, fecha_deteccion: '2024-05-13 14:30:00', tipo_incidente: 'ACCESO_NO_AUTORIZADO', nivel_gravedad: 'ALTO', descripcion: 'Intento de acceso a módulo de finanzas sin permisos', estado: 'EN_INVESTIGACION' },
];
// ── MÓDULO 25 ──────────────────────────────────────────────
export const CAMPANAS: CampanaMarketing[] = [
  { id_campana_marketing: 1, nombre_campana: 'Verano en Europa 2024',     tipo_campana: 'EMAIL',         objetivo: 'VENTAS',       fecha_inicio: '2024-05-01', fecha_fin: '2024-08-31', presupuesto: 45000, activa: 1 },
  { id_campana_marketing: 2, nombre_campana: 'Descubre Centroamérica',    tipo_campana: 'REDES_SOCIALES',objetivo: 'NOTORIEDAD',   fecha_inicio: '2024-04-15', fecha_fin: '2024-07-15', presupuesto: 28000, activa: 1 },
  { id_campana_marketing: 3, nombre_campana: 'Programa Fidelización Q2',  tipo_campana: 'APP',           objetivo: 'FIDELIZACION', fecha_inicio: '2024-04-01', fecha_fin: '2024-06-30', presupuesto: 15000, activa: 1 },
];
export const SEGMENTOS: SegmentoCliente[] = [
  { id_segmento_cliente: 1, nombre_segmento: 'Viajeros de Negocios',  descripcion: 'Pasajeros frecuentes clase ejecutiva', frecuencia_viajes: 'ALTA',    activo: 1 },
  { id_segmento_cliente: 2, nombre_segmento: 'Turistas de Temporada', descripcion: 'Viajeros vacacionales estacionales',    frecuencia_viajes: 'OCASIONAL',activo: 1 },
  { id_segmento_cliente: 3, nombre_segmento: 'Familias',              descripcion: 'Grupos familiares con menores',         frecuencia_viajes: 'BAJA',    activo: 1 },
];
// ── MÓDULO 26 ──────────────────────────────────────────────
export const CONTRATOS_DATA: Contrato[] = [
  { id_contrato: 1, numero_contrato: 'CONT-2024-001', nombre_contrato: 'Concesión Café Tostado GT',   tipo_contrato: 'CONCESION', contraparte_nombre: 'Grupo Café SA',      fecha_firma: '2024-01-15', fecha_inicio: '2024-02-01', fecha_fin: '2027-01-31', monto_total: 450000, estado: 'VIGENTE' },
  { id_contrato: 2, numero_contrato: 'CONT-2024-002', nombre_contrato: 'Servicio Seguridad Privada',  tipo_contrato: 'SERVICIOS', contraparte_nombre: 'ProSecure GT',       fecha_firma: '2024-01-10', fecha_inicio: '2024-02-01', fecha_fin: '2025-01-31', monto_total: 840000, estado: 'VIGENTE' },
  { id_contrato: 3, numero_contrato: 'CONT-2023-015', nombre_contrato: 'Suministro Combustible JET-A1',tipo_contrato: 'SUMINISTRO',contraparte_nombre: 'AviCombustibles SA', fecha_firma: '2023-11-01', fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31', monto_total: 2400000, estado: 'VIGENTE' },
];
export const NORMATIVAS: Normativa[] = [
  { id_normativa: 1, codigo_normativa: 'OACI-DOC4444', titulo_normativa: 'Procedimientos para Servicios de Navegación Aérea', entidad_emisora: 'OACI', ambito_aplicacion: 'INTERNACIONAL', fecha_vigencia: '2020-11-05', activa: 1 },
  { id_normativa: 2, codigo_normativa: 'DGAC-GT-001',   titulo_normativa: 'Reglamento Aeronáutico Civil Guatemala',           entidad_emisora: 'DGAC', ambito_aplicacion: 'NACIONAL',       fecha_vigencia: '2019-03-15', activa: 1 },
];
// ── MÓDULO 27 ──────────────────────────────────────────────
export const RUTAS_TRANSPORTE: RutaTransporte[] = [
  { id_ruta_transporte: 1, codigo_ruta: 'RT-GUA-001', nombre_ruta: 'Aeropuerto – Zona Viva',    origen: 'Aeropuerto La Aurora', destino: 'Zona Viva – Zona 10',    distancia_km: 8.5,  tipo_ruta: 'AEROPUERTO_CENTRO', activa: 1 },
  { id_ruta_transporte: 2, codigo_ruta: 'RT-GUA-002', nombre_ruta: 'Aeropuerto – Westin Hotel', origen: 'Aeropuerto La Aurora', destino: 'Hotel Westin Camino Real',distancia_km: 3.2,  tipo_ruta: 'AEROPUERTO_HOTEL',  activa: 1 },
  { id_ruta_transporte: 3, codigo_ruta: 'RT-GUA-003', nombre_ruta: 'Aeropuerto – Antigua GT',   origen: 'Aeropuerto La Aurora', destino: 'Antigua Guatemala',       distancia_km: 45.0, tipo_ruta: 'INTERURBANA', activa: 1 },
];
export const VEHICULOS: VehiculoTransporte[] = [
  { id_vehiculo_transporte: 1, placa: 'GUA-001-ABC', tipo_vehiculo: 'VAN',  marca: 'Toyota', modelo: 'Hiace', capacidad_pasajeros: 12, disponible: 1, activo: 1 },
  { id_vehiculo_transporte: 2, placa: 'GUA-002-DEF', tipo_vehiculo: 'TAXI', marca: 'Toyota', modelo: 'Corolla', capacidad_pasajeros: 4, disponible: 1, activo: 1 },
  { id_vehiculo_transporte: 3, placa: 'GUA-003-GHI', tipo_vehiculo: 'BUS',  marca: 'Mercedes', modelo: 'Sprinter', capacidad_pasajeros: 25, disponible: 0, activo: 1 },
];
export const CHOFERES: ChoferTransporte[] = [
  { id_chofer_transporte: 1, nombres: 'Pedro',  apellidos: 'Ajú Tzul',     licencia_conducir: 'LIC-GT-001245', fecha_vencimiento_licencia: '2026-05-10', telefono: '5123-4567', disponible: 1, activo: 1 },
  { id_chofer_transporte: 2, nombres: 'Miguel', apellidos: 'Cac Chávez',   licencia_conducir: 'LIC-GT-008712', fecha_vencimiento_licencia: '2025-11-30', telefono: '5234-5678', disponible: 1, activo: 1 },
  { id_chofer_transporte: 3, nombres: 'Juan',   apellidos: 'Toc Mendoza',  licencia_conducir: 'LIC-GT-015430', fecha_vencimiento_licencia: '2024-12-15', telefono: '5345-6789', disponible: 0, activo: 1 },
];
export const RESERVAS_TRANSPORTE: ReservaTransporte[] = [
  { id_reserva_transporte: 1, codigo_reserva_transporte: 'RT-2024-0001', id_pasajero: 1, lugar_recogida: 'Terminal Internacional – Salidas', lugar_destino: 'Zona 10, Cdad. Guatemala', fecha_servicio: '2024-05-15', estado_reserva: 'COMPLETADA', precio_total: 85 },
  { id_reserva_transporte: 2, codigo_reserva_transporte: 'RT-2024-0002', id_pasajero: 3, lugar_recogida: 'Hotel Westin',                    lugar_destino: 'Aeropuerto La Aurora',      fecha_servicio: '2024-05-16', estado_reserva: 'CONFIRMADA', precio_total: 45 },
];
// ── MÓDULO 28 ──────────────────────────────────────────────
export const PLANES_EMERG: PlanEmergencia[] = [
  { id_plan_emergencia: 1, codigo_plan: 'PE-INC-001', nombre_plan: 'Plan Evacuación por Incendio',      tipo_emergencia: 'INCENDIO',       nivel_activacion: 'EMERGENCIA', responsable_activacion: 'Dir. Operaciones', activo: 1 },
  { id_plan_emergencia: 2, codigo_plan: 'PE-ACC-001', nombre_plan: 'Plan Accidente Aéreo',              tipo_emergencia: 'ACCIDENTE_AEREO',nivel_activacion: 'CRISIS',     responsable_activacion: 'Dir. General',     activo: 1 },
  { id_plan_emergencia: 3, codigo_plan: 'PE-SIS-001', nombre_plan: 'Plan Evacuación por Sismo',         tipo_emergencia: 'TERREMOTO',      nivel_activacion: 'ALERTA',     responsable_activacion: 'Jefe Seguridad',   activo: 1 },
  { id_plan_emergencia: 4, codigo_plan: 'PE-MED-001', nombre_plan: 'Plan Emergencia Médica Masiva',     tipo_emergencia: 'EMERGENCIA_MEDICA_MASIVA', nivel_activacion: 'EMERGENCIA', responsable_activacion: 'Dir. Médico', activo: 1 },
];
export const EQUIPOS_EMERG: EquipoEmergencia[] = [
  { id_equipo_emergencia: 1, codigo_equipo: 'EQ-AMB-001', nombre_equipo: 'Ambulancia ALS 1',    tipo_equipo: 'AMBULANCIA',    ubicacion_habitual: 'Hangar Emergencias', estado: 'DISPONIBLE', activo: 1 },
  { id_equipo_emergencia: 2, codigo_equipo: 'EQ-CBM-001', nombre_equipo: 'Camión Bomba ARFF 1', tipo_equipo: 'CAMION_BOMBA',  ubicacion_habitual: 'Estación ARFF',      estado: 'DISPONIBLE', activo: 1 },
  { id_equipo_emergencia: 3, codigo_equipo: 'EQ-RES-001', nombre_equipo: 'Unidad Rescate UR-1', tipo_equipo: 'UNIDAD_RESCATE',ubicacion_habitual: 'Base Operaciones',   estado: 'EN_MANTENIMIENTO', activo: 1 },
  { id_equipo_emergencia: 4, codigo_equipo: 'EQ-GEN-001', nombre_equipo: 'Generador Principal', tipo_equipo: 'GENERADOR',     ubicacion_habitual: 'Cuarto Eléctrico',   estado: 'DISPONIBLE', activo: 1 },
];
export const ACTIVACIONES: ActivacionEmergencia[] = [
  { id_activacion: 1, tipo_emergencia: 'INCENDIO', nivel_activacion: 'ALERTA', lugar_incidente: 'Terminal A – Local Comercial 12', personas_afectadas: 120, estado: 'FINALIZADA', fecha_hora_activacion: '2024-03-10T14:30:00' },
  { id_activacion: 2, tipo_emergencia: 'EMERGENCIA_MEDICA_MASIVA', nivel_activacion: 'PREALERTA', lugar_incidente: 'Sala de Espera Internacional', personas_afectadas: 8, estado: 'FINALIZADA', fecha_hora_activacion: '2024-04-22T10:15:00' },
];
// ── MÓDULO 29 ──────────────────────────────────────────────
export const REPORTES_OACI: ReporteOaci[] = [
  { id_reporte_oaci: 1, tipo_reporte: 'ESTADISTICO', periodo: 'MENSUAL',    fecha_inicio_periodo: '2024-04-01', fecha_fin_periodo: '2024-04-30', estado: 'ENVIADO' },
  { id_reporte_oaci: 2, tipo_reporte: 'SEGURIDAD',   periodo: 'TRIMESTRAL', fecha_inicio_periodo: '2024-01-01', fecha_fin_periodo: '2024-03-31', estado: 'RECIBIDO' },
  { id_reporte_oaci: 3, tipo_reporte: 'OPERACIONES', periodo: 'MENSUAL',    fecha_inicio_periodo: '2024-05-01', fecha_fin_periodo: '2024-05-31', estado: 'GENERADO' },
];
export const CERTIFICACIONES_INT: CertificacionInternacional[] = [
  { id_certificacion_internacional: 1, nombre_certificacion: 'ISO 9001:2015 – Sistema de Gestión de Calidad',         organismo_certificador: 'Bureau Veritas', fecha_emision: '2022-08-10', fecha_vencimiento: '2025-08-10', numero_certificado: 'BV-GT-2022-001', activa: 1 },
  { id_certificacion_internacional: 2, nombre_certificacion: 'ACI – Airport Service Quality (ASQ)',                   organismo_certificador: 'ACI World',     fecha_emision: '2023-03-15', fecha_vencimiento: '2026-03-15', numero_certificado: 'ACI-ASQ-2023-GT',activa: 1 },
  { id_certificacion_internacional: 3, nombre_certificacion: 'Acreditación OACI – USAP (Universal Security Audit)',   organismo_certificador: 'OACI',          fecha_emision: '2021-11-20', fecha_vencimiento: '2027-11-20', numero_certificado: 'OACI-USAP-GT-21', activa: 1 },
];
