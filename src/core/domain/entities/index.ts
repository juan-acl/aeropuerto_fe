/**
 * Domain Entities — TypeScript interfaces mapping Oracle tables exactly.
 * NUMBER → number, VARCHAR2 → string, DATE/TIMESTAMP → string (ISO), BLOB → string (base64)
 * All nullable Oracle columns are typed as optional (?)
 */

// ─── MODULE 1: Airport Infrastructure ──────────────────────────────────────
export interface Aeropuerto {
  codigo_aeropuerto: string;        // PK natural IATA
  nombre: string;
  ciudad: string;
  pais: string;
  region?: string;
  continente?: string;
  huso_horario?: string;
  latitud?: number;
  longitud?: number;
  elevacion_metros?: number;
  terminales?: number;
  puertas_abordaje?: number;
  activo: 0 | 1;
  fecha_registro?: string;
}

export interface PistaAterrizaje {
  id_pista: number;
  codigo_aeropuerto: string;
  numero_pista: string;
  longitud_metros?: number;
  anchura_metros?: number;
  superficie?: 'ASFALTO' | 'CONCRETO' | 'HIERBA' | 'GRAVA';
  iluminacion_nocturna: 0 | 1;
  sistema_ils: 0 | 1;
  activo: 0 | 1;
}

export interface PuertaEmbarque {
  id_puerta: number;
  codigo_aeropuerto: string;
  numero_puerta: string;
  terminal?: string;
  tipo_puerta?: 'NACIONAL' | 'INTERNACIONAL' | 'MIXTA';
  capacidad_maxima?: number;
  tiene_pasarela: 0 | 1;
  activo: 0 | 1;
}

// ─── MODULE 2: Fleet ────────────────────────────────────────────────────────
export interface ModeloAvion {
  id_modelo: number;
  nombre_modelo: string;
  fabricante?: string;
  capacidad_pasajeros: number;
  capacidad_carga_kg?: number;
  autonomia_km?: number;
  velocidad_crucero_kmh?: number;
  longitud_metros?: number;
  envergadura_metros?: number;
  tripulacion_minima?: number;
  activo: 0 | 1;
}

export interface MantenimientoAvion {
  id_mantenimiento: number;
  matricula_avion: string;
  id_modelo?: number;
  fecha_mantenimiento: string;
  tipo_mantenimiento: 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO' | 'MAYOR';
  descripcion?: string;
  horas_vuelo_actuales?: number;
  proximo_mantenimiento?: string;
  costo?: number;
  taller?: string;
  tecnico_responsable?: string;
}

// ─── MODULE 3: Airlines ─────────────────────────────────────────────────────
export interface Aerolinea {
  id_aerolinea: number;
  nombre_aerolinea: string;
  codigo_iata?: string;
  codigo_oaci?: string;
  pais_origen?: string;
  flota_total?: number;
  destinos_totales?: number;
  alianza?: 'STAR_ALLIANCE' | 'SKYTEAM' | 'ONEWORLD' | 'NINGUNA';
  website?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  activo: 0 | 1;
}

export interface FranquiciaEquipaje {
  id_franquicia: number;
  id_aerolinea: number;
  clase_servicio: 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
  peso_maximo_kg: number;
  piezas_permitidas: number;
  exceso_equipaje_costo?: number;
  moneda?: string;
}

// ─── MODULE 4: Flight Programming ──────────────────────────────────────────
export interface ProgramaVuelo {
  id_programa: number;
  numero_vuelo: string;
  id_aerolinea: number;
  aeropuerto_origen: string;
  aeropuerto_destino: string;
  tipo_vuelo?: 'NACIONAL' | 'INTERNACIONAL';
  dias_semana?: string;
  frecuencia_semanal?: number;
  duracion_estimada_minutos?: number;
  distancia_km?: number;
  clase_servicio?: 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE' | 'MIXTA';
  activo: 0 | 1;
}

export interface TemporadaVuelo {
  id_temporada: number;
  nombre_temporada?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  factor_demanda?: number; // 0.5-2.0, used for dynamic pricing
  activa: 0 | 1;
}

export interface RestriccionVuelo {
  id_restriccion: number;
  id_programa: number;
  tipo_restriccion?: 'CLIMATICA' | 'POLITICA' | 'SEGURIDAD' | 'TECNICA';
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activa: 0 | 1;
}

// ─── MODULE 5: Flight Operations ────────────────────────────────────────────
export type EstadoVuelo = 'PROGRAMADO' | 'EN_VUELO' | 'ATERRIZADO' | 'CANCELADO' | 'REPROGRAMADO' | 'DEMORADO' | 'DESVIADO';

export interface Vuelo {
  id_vuelo: number;
  id_programa: number;
  fecha_vuelo: string;
  hora_salida_programada: string;
  hora_llegada_programada: string;
  hora_salida_real?: string;
  hora_llegada_real?: string;
  id_modelo_avion?: number;
  matricula_avion?: string;
  plazas_vacias?: number;
  plazas_ocupadas?: number;
  capacidad_total?: number;
  carga_kg?: number;
  combustible_litros?: number;
  estado_vuelo: EstadoVuelo;
  motivo_cancelacion?: string;
  fecha_reprogramado?: string;
  id_puerta_salida?: number;
  id_puerta_llegada?: number;
  // Denormalized for convenience (from programas_vuelo JOIN)
  numero_vuelo?: string;
  aeropuerto_origen?: string;
  aeropuerto_destino?: string;
  id_aerolinea?: number;
}

export interface RetrasoVuelo {
  id_retraso: number;
  id_vuelo: number;
  minutos_retraso: number;
  tipo_retraso: 'CLIMATICO' | 'TECNICO' | 'OPERACIONAL' | 'TRANSITO' | 'TRIPULACION';
  causa?: string;
  responsable?: string;
  compensacion_pasajeros: 0 | 1;
}

export interface CancelacionVuelo {
  id_cancelacion: number;
  id_vuelo: number;
  fecha_cancelacion: string;
  motivo_principal: string;
  motivo_detallado?: string;
  notificado_a_pasajeros: 0 | 1;
  fecha_notificacion?: string;
  pasajeros_reubicados?: number;
  costo_compensacion?: number;
}

export interface CombustibleVuelo {
  id_combustible: number;
  id_vuelo: number;
  combustible_planeado_litros?: number;
  combustible_real_litros?: number;
  combustible_extra_litros?: number;
  tipo_combustible?: string;
  proveedor?: string;
  costo_total?: number;
}

export interface IncidenteVuelo {
  id_incidente_vuelo: number;
  id_vuelo: number;
  tipo_incidente: 'TECNICO' | 'MEDICO' | 'SEGURIDAD' | 'CLIMATICO' | 'OPERATIVO';
  gravedad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  descripcion?: string;
  acciones_tomadas?: string;
  reportado_por?: string;
  fecha_incidente?: string;
}

export interface CondicionMeteorologica {
  id_condicion: number;
  codigo_aeropuerto: string;
  fecha_hora: string;
  temperatura?: number;
  humedad?: number;
  presion_atmosferica?: number;
  viento_velocidad?: number;
  viento_direccion?: string;
  visibilidad_km?: number;
  condicion_general?: string;
  fenomenos_especiales?: string;
}

// ─── MODULE 6: Crew ─────────────────────────────────────────────────────────
export interface Tripulante {
  id_tripulante: number;
  nombres: string;
  apellidos: string;
  numero_documento?: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  tipo_tripulante: 'PILOTO' | 'COPILOTO' | 'SOBRECARGO' | 'INGENIERO' | 'AUXILIAR';
  licencia?: string;
  fecha_vencimiento_licencia?: string;
  horas_vuelo_acumuladas?: number;
  email?: string;
  telefono?: string;
  activo: 0 | 1;
}

export type EstadoTripulante = 'DISPONIBLE' | 'EN_VUELO' | 'DESCANSO' | 'INCAPACIDAD';

export interface TripulacionDisponibilidad {
  id_disponibilidad: number;
  id_tripulante: number;
  estado: EstadoTripulante;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_disponible?: string;
  horas_maximas_diarias?: number;
  disponible: 0 | 1;
  observaciones?: string;
}

// ─── MODULE 7: Passengers ────────────────────────────────────────────────────
export interface Pasajero {
  id_pasajero: number;
  nombres: string;
  apellidos: string;
  tipo_documento?: 'PASAPORTE' | 'DPI' | 'VISA' | 'CARNET';
  numero_documento: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  email?: string;
  telefono?: string;
  genero?: 'M' | 'F' | 'O';
  ciudad_residencia?: string;
  pais_residencia?: string;
  foto?: string; // base64
  activo?: 0 | 1;
}

export interface PerfilViajero {
  id_perfil: number;
  id_pasajero: number;
  tipo_perfil?: 'FRECUENTE' | 'CORPORATIVO' | 'TURISTA' | 'VIP';
  numero_programa?: string;
  puntos_acumulados?: number;
  categoria?: string;
  // Extended from perfiles_viajero
  preferencias_asiento?: string;
  preferencias_comida?: string;
  nivel_lealtad?: 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';
}

export interface HistorialMedico {
  id_historial_medico: number;
  id_pasajero: number;
  condicion_medica?: string;
  medicamentos?: string;
  alergias?: string;
  contacto_emergencia?: string;
  // CRITICAL: Only accessible to medical/security roles
}

// ─── MODULE 8: Reservations ──────────────────────────────────────────────────
export type EstadoReserva = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA' | 'CHECK_IN' | 'ABORDADO' | 'NO_SHOW';

export interface Reserva {
  id_reserva: number;
  id_vuelo: number;
  id_pasajero: number;
  codigo_reserva: string;
  fecha_reserva: string;
  fecha_modificacion?: string;
  estado_reserva: EstadoReserva;
  tipo_tarifa?: string;
  precio_pagado?: number;
  moneda?: string;
  numero_asiento?: string;
  clase_servicio?: 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
  equipaje_facturado_kg?: number;
  equipaje_mano_kg?: number;
  checkin_realizado: 0 | 1;
  fecha_checkin?: string;
  puerta_embarque_asignada?: string;
  grupo_embarque?: string;
  // Denormalized
  pasajero_nombre?: string;
  numero_vuelo?: string;
}

export interface ReservaPago {
  id_pago: number;
  id_reserva: number;
  id_metodo_pago?: number;
  monto: number;
  moneda: string;
  fecha_pago: string;
  codigo_transaccion?: string;
  estado_pago: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO';
}

export interface Factura {
  id_factura: number;
  id_reserva: number;
  numero_factura: string;
  fecha_emision?: string;
  subtotal?: number;
  impuestos?: number;
  total?: number;
  moneda?: string;
  datos_fiscales?: string;
}

export interface Promocion {
  id_promocion: number;
  nombre_promocion?: string;
  codigo_promocion?: string;
  tipo_descuento?: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1' | 'UPGRADE';
  valor_descuento?: number;
  condiciones?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  usos_maximos?: number;
  usos_actuales?: number;
  activa: 0 | 1;
}

// ─── MODULE 9: Check-in ──────────────────────────────────────────────────────
export interface CheckinDigital {
  id_checkin: number;
  id_reserva: number;
  fecha_checkin: string;
  canal: 'WEB' | 'APP' | 'KIOSKO' | 'MOSTRADOR';
  asiento_seleccionado?: string;
  equipaje_declarado_kg?: number;
  documentos_verificados: 0 | 1;
  estado: 'INICIADO' | 'COMPLETADO' | 'CANCELADO';
}

export interface PaseAbordaje {
  id_pase: number;
  id_checkin: number;
  numero_pase?: string;
  codigo_barras?: string;
  qr_code?: string; // base64 or URL
  numero_asiento?: string;
  puerta?: string;
  grupo_embarque?: string;
  hora_embarque?: string;
  impreso: 0 | 1;
  descargado: 0 | 1;
}

export interface ControlAbordaje {
  id_control_abordaje: number;
  id_pase: number;
  id_empleado?: number;
  timestamp_abordaje: string;
  estado: 'ABORDADO' | 'RECHAZADO' | 'DUPLICADO';
  observaciones?: string;
}

// ─── MODULE 10: Security ─────────────────────────────────────────────────────
export interface Incidente {
  id_incidente: number;
  tipo: string;
  gravedad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  descripcion?: string;
  fecha_incidente?: string;
  estado: 'ABIERTO' | 'EN_INVESTIGACION' | 'CERRADO' | 'ARCHIVADO';
  oficial_cargo?: string;
  ubicacion?: string;
  numero_vuelo?: string;
  nivel_gravedad?: string;
  acciones_tomadas?: string;
}

export interface ProhibicionVuelo {
  id_prohibicion: number;
  id_pasajero: number;
  motivo: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo_prohibicion: 'TEMPORAL' | 'PERMANENTE';
  autoridad_emisora?: string;
  activa: 0 | 1;
}

export interface EmergenciaMedica {
  id_emergencia: number;
  id_vuelo?: number;
  id_pasajero?: number;
  tipo_emergencia: string;
  diagnostico_inicial?: string;
  tratamiento?: string;
  requiere_hospitalizacion: 0 | 1;
  requiere_aterrizaje_emergencia?: 0 | 1;
  medidas_tomadas?: string;
}

// ─── MODULE 14: Passenger Services ───────────────────────────────────────────
export interface HotelCercano {
  id_hotel: number;
  nombre_hotel: string;
  categoria_estrellas?: number;
  distancia_km?: number;
  precio_noche?: number;
  disponibilidad?: number;
  telefono?: string;
  convenio_aeropuerto: 0 | 1;
  codigo_aeropuerto?: string;
}

export interface ProgramaLealtad {
  id_programa_lealtad: number;
  id_pasajero: number;
  nivel: 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';
  puntos_actuales: number;
  puntos_ganados_totales?: number;
  puntos_redimidos?: number;
  fecha_vencimiento_puntos?: string;
}

export interface QuejaSugerencia {
  id_queja: number;
  id_pasajero?: number;
  tipo: 'QUEJA' | 'SUGERENCIA' | 'FELICITACION';
  descripcion: string;
  canal?: string;
  estado?: string;
  fecha_respuesta?: string;
}

// ─── MODULE 15: HR ────────────────────────────────────────────────────────────
export interface Empleado {
  id: number;
  codigo?: string;
  nombres: string;
  apellidos: string;
  id_departamento?: number;
  cargo?: string;
  departamento?: string;
  email?: string;
  email_institucional?: string;
  telefono?: string;
  salario_base?: number;
  fecha_contratacion?: string;
  tipo_contrato?: 'PERMANENTE' | 'TEMPORAL' | 'PRACTICAS' | 'CONSULTOR';
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  activo: 0 | 1;
}

// ─── MODULE 24: Auth / System Security ───────────────────────────────────────
export type NivelAcceso = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface UsuarioSistema {
  id_usuario_sistema: number;
  nombre_usuario: string;
  email_institucional: string;
  id_empleado?: number;
  activo: 0 | 1;
  ultimo_acceso?: string;
  intentos_fallidos: number;
  bloqueado: 0 | 1;
}

export interface RolSistema {
  id_rol_sistema: number;
  nombre_rol: string;
  descripcion?: string;
  nivel_jerarquico: number;
  activo: 0 | 1;
}

export interface PermisoModulo {
  id_rol: number;
  id_modulo: number;
  puede_ver: 0 | 1;
  puede_crear: 0 | 1;
  puede_editar: 0 | 1;
  puede_eliminar: 0 | 1;
}

export interface IncidenteSeguridad {
  id_incidente_seguridad_info: number;
  fecha_deteccion: string;
  tipo_incidente: string;
  nivel_gravedad: string;
  descripcion: string;
  estado: string;
}

// ─── MODULE 19: Cargo ─────────────────────────────────────────────────────────
export interface EnvioCarga {
  id_envio: number;
  codigo_envio?: string;
  id_vuelo?: number;
  tipo_carga?: string;
  peso_kg?: number;
  volumen_m3?: number;
  cantidad_bultos?: number;
  contenido?: string;
  valor_declarado?: number;
  consignador_nombre?: string;
  consignatario_nombre?: string;
  estado?: 'RECIBIDO' | 'EN_BODEGA' | 'CARGADO' | 'EN_VUELO' | 'DESCARGADO' | 'ENTREGADO' | 'ADUANA';
}

// ─── MODULE 25: Marketing ─────────────────────────────────────────────────────
export interface CampanaMarketing {
  id_campana_marketing: number;
  nombre_campana: string;
  tipo_campana?: 'EMAIL' | 'SMS' | 'PUSH' | 'REDES' | 'DISPLAY';
  fecha_inicio?: string;
  fecha_fin?: string;
  presupuesto?: number;
  objetivo?: string;
  activa: 0 | 1;
}

export interface OfertaPersonalizada {
  id_oferta: number;
  id_segmento?: number;
  titulo: string;
  descuento?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  activa: 0 | 1;
}

// ─── Finance ──────────────────────────────────────────────────────────────────
export interface Presupuesto {
  id: number;
  anio: number;
  mes?: number;
  concepto: string;
  departamento?: string;
  monto_asignado: number;
  monto_ejecutado: number;
  tipo?: string;
}

export interface CuentaBancaria {
  id_cuenta: number;
  banco: string;
  tipo_cuenta?: string;
  numero_cuenta?: string;
  moneda?: string;
  saldo_actual?: number;
  estado?: string;
}
