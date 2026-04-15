// ═══════════════════════════════════════════════
// MÓDULO 1: INFRAESTRUCTURA AEROPORTUARIA
// ═══════════════════════════════════════════════
export interface Aeropuerto {
  codigo_aeropuerto: string; nombre: string; ciudad: string; pais: string;
  region?: string; continente?: string; huso_horario?: string;
  latitud?: number; longitud?: number; elevacion_metros?: number;
  terminales?: number; puertas_abordaje?: number; activo: number;
}
export interface PistaAterrizaje {
  id_pista: number; codigo_aeropuerto: string; numero_pista: string;
  longitud_metros?: number; anchura_metros?: number;
  superficie?: 'ASFALTO'|'CONCRETO'|'HIERBA'|'GRAVA';
  iluminacion_nocturna: number; sistema_ils: number; activo: number;
  categoria_oaci?: string;
}
export interface PuertaEmbarque {
  id_puerta: number; codigo_aeropuerto: string; numero_puerta: string;
  terminal?: string; tipo_puerta?: 'NACIONAL'|'INTERNACIONAL'|'MIXTA';
  capacidad_maxima?: number; tiene_pasarela: number; activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 2: FLOTA AÉREA
// ═══════════════════════════════════════════════
export interface ModeloAvion {
  id_modelo: number; nombre_modelo: string; fabricante?: string;
  capacidad_pasajeros: number; capacidad_carga_kg?: number;
  autonomia_km?: number; velocidad_crucero_kmh?: number;
  tripulacion_minima?: number; activo: number;
}
export interface MantenimientoAvion {
  id_mantenimiento: number; matricula_avion: string; id_modelo?: number;
  fecha_mantenimiento: string;
  tipo_mantenimiento: 'PREVENTIVO'|'CORRECTIVO'|'PREDICTIVO'|'MAYOR';
  descripcion?: string; horas_vuelo_actuales?: number;
  proximo_mantenimiento?: string; costo?: number; taller?: string;
  tecnico_responsable?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 3: AEROLÍNEAS
// ═══════════════════════════════════════════════
export interface Aerolinea {
  id_aerolinea: number; nombre_aerolinea: string;
  codigo_iata?: string; codigo_oaci?: string; pais_origen?: string;
  flota_total?: number; destinos_totales?: number;
  alianza?: 'STAR_ALLIANCE'|'SKYTEAM'|'ONEWORLD'|'NINGUNA';
  activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 4: PROGRAMACIÓN DE VUELOS
// ═══════════════════════════════════════════════
export interface ProgramaVuelo {
  id_programa: number; numero_vuelo: string; id_aerolinea: number;
  aeropuerto_origen: string; aeropuerto_destino: string;
  tipo_vuelo?: 'NACIONAL'|'INTERNACIONAL';
  duracion_estimada_minutos?: number; distancia_km?: number;
  clase_servicio?: 'ECONOMICA'|'EJECUTIVA'|'PRIMERA_CLASE'|'MIXTA';
  activo: number; fecha_inicio?: string; fecha_fin?: string;
}
export interface TemporadaVuelo {
  id_temporada: number; nombre_temporada?: string;
  fecha_inicio?: string; fecha_fin?: string;
  factor_demanda?: number; activa: number;
}
export interface RestriccionVuelo {
  id_restriccion: number; id_programa: number;
  tipo_restriccion?: 'CLIMATICA'|'POLITICA'|'SEGURIDAD'|'TECNICA';
  descripcion?: string; fecha_inicio?: string; fecha_fin?: string; activa: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 5: OPERACIONES DE VUELO
// ═══════════════════════════════════════════════
export interface Vuelo {
  id_vuelo: number; id_programa: number; fecha_vuelo: string;
  hora_salida_programada: string; hora_llegada_programada: string;
  hora_salida_real?: string; hora_llegada_real?: string;
  matricula_avion?: string; plazas_vacias?: number; plazas_ocupadas?: number;
  estado_vuelo: 'PROGRAMADO'|'EN_VUELO'|'ATERRIZADO'|'CANCELADO'|'REPROGRAMADO'|'DEMORADO'|'DESVIADO';
  id_puerta_salida?: number;
  numero_vuelo?: string; aeropuerto_origen?: string; aeropuerto_destino?: string;
  id_modelo_avion?: number; id_aerolinea?: number; capacidad_total?: number;
}
export interface IncidenteVuelo {
  id_incidente_vuelo: number; id_vuelo: number; fecha_incidente: string;
  tipo_incidente: 'TECNICO'|'MEDICO'|'SEGURIDAD'|'CLIMATICO'|'OPERATIVO';
  descripcion?: string; gravedad: 'BAJA'|'MEDIA'|'ALTA'|'CRITICA';
  acciones_tomadas?: string; reportado_por?: string;
}
export interface RetrasoVuelo {
  id_retraso: number; id_vuelo: number; minutos_retraso: number;
  tipo_retraso: 'CLIMATICO'|'TECNICO'|'OPERACIONAL'|'TRANSITO'|'TRIPULACION';
  causa?: string; responsable?: string; compensacion_pasajeros: number;
}
export interface CancelacionVuelo {
  id_cancelacion: number; id_vuelo: number; fecha_cancelacion: string;
  motivo_principal?: string; motivo_detallado?: string;
  notificado_a_pasajeros: number; pasajeros_reubicados?: number;
  costo_compensacion?: number;
}
export interface CombustibleVuelo {
  id_combustible: number; id_vuelo: number;
  combustible_planeado_litros?: number; combustible_real_litros?: number;
  tipo_combustible?: string; proveedor?: string; costo_total?: number;
}
export interface EscalaTecnica {
  id_escala: number; id_vuelo: number; aeropuerto_escala: string;
  numero_orden: number; hora_llegada?: string; hora_despegue?: string;
  tiempo_escala_minutos?: number;
  motivo_escala?: 'TECNICA'|'COMBUSTIBLE'|'TRIPULACION'|'CLIMATICA'|'OTROS';
}
// ═══════════════════════════════════════════════
// MÓDULO 6: TRIPULACIÓN
// ═══════════════════════════════════════════════
export interface Tripulante {
  id_tripulante: number; nombres: string; apellidos: string;
  tipo_documento?: string; numero_documento?: string;
  tipo_tripulante?: 'PILOTO'|'COPILOTO'|'SOBRECARGO'|'INGENIERO'|'AUXILIAR';
  licencia?: string; fecha_vencimiento_licencia?: string;
  horas_vuelo_acumuladas?: number; activo: number;
  nacionalidad?: string; email?: string; telefono?: string;
}
export interface TripulacionCertificacion {
  id_certificacion: number; id_tripulante: number;
  tipo_certificacion?: string; fecha_obtencion?: string;
  fecha_vencimiento?: string; entidad_certificadora?: string; activa: number;
}
export interface TripulacionDisponibilidad {
  id_disponibilidad: number; id_tripulante: number;
  fecha_inicio: string; fecha_fin: string;
  horas_maximas_diarias?: number; disponible: number; observaciones?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 7: PASAJEROS
// ═══════════════════════════════════════════════
export interface Pasajero {
  id_pasajero: number; nombres: string; apellidos: string;
  tipo_documento?: 'DPI'|'PASAPORTE'|'OTRO'; numero_documento: string;
  nacionalidad?: string; fecha_nacimiento?: string;
  genero?: 'M'|'F'|'O'; telefono?: string; email?: string;
  ciudad_residencia?: string; pais_residencia?: string;
}
export interface PerfilViajero {
  id_perfil: number; id_pasajero: number;
  tipo_perfil?: 'FRECUENTE'|'OCASIONAL'|'VIP'|'CORPORATIVO';
  numero_programa?: string; puntos_acumulados: number; categoria?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 8: RESERVAS Y BOLETERÍA
// ═══════════════════════════════════════════════
export interface Reserva {
  id_reserva: number; id_vuelo: number; id_pasajero: number;
  codigo_reserva: string; fecha_reserva?: string;
  estado_reserva: 'CONFIRMADA'|'PENDIENTE'|'CANCELADA'|'CHECK_IN'|'ABORDADO'|'NO_SHOW';
  precio_pagado?: number; moneda?: string; numero_asiento?: string;
  clase_servicio?: string; checkin_realizado: number;
  pasajero_nombre?: string; numero_vuelo?: string; aeropuerto_destino?: string;
}
export interface Factura {
  id_factura: number; id_reserva: number; numero_factura: string;
  fecha_emision?: string; subtotal?: number; impuestos?: number;
  total?: number; moneda?: string;
}
export interface Promocion {
  id_promocion: number; codigo_promocion?: string; nombre_promocion?: string;
  tipo_descuento?: 'PORCENTAJE'|'MONTO_FIJO'|'2X1'|'OTRO';
  valor_descuento?: number; fecha_inicio?: string; fecha_fin?: string;
  uso_maximo?: number; usos_actuales: number; activa: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 9: CHECK-IN Y ABORDAJE
// ═══════════════════════════════════════════════
export interface CheckinDigital {
  id_checkin: number; id_reserva: number; fecha_checkin: string;
  dispositivo?: string; pase_abordaje_generado: number;
  enviado_email: number; enviado_sms: number;
}
export interface ControlAbordaje {
  id_control_abordaje: number; id_vuelo: number; id_reserva: number;
  hora_abordaje?: string; estado: 'ABORDADO'|'NO_ABORDADO'; observaciones?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 10: SEGURIDAD
// ═══════════════════════════════════════════════
export interface Incidente {
  id_incidente: number; id_pasajero?: number; id_vuelo?: number;
  fecha_incidente: string;
  tipo_incidente: 'ARRESTO'|'INFRACCION'|'INCIDENTE'|'EMERGENCIA_MEDICA'|'SEGURIDAD'|'DISCUSION'|'ROBO';
  nivel_gravedad: 'BAJO'|'MEDIO'|'ALTO'|'CRITICO';
  descripcion: string; estado: string; oficial_a_cargo?: string;
}
export interface ProhibicionVuelo {
  id_prohibicion: number; id_pasajero: number;
  fecha_inicio?: string; fecha_fin?: string;
  motivo?: string; activa: number;
}
export interface EmergenciaMedica {
  id_emergencia: number; id_pasajero?: number; id_vuelo?: number;
  fecha_emergencia: string; tipo_emergencia?: string;
  diagnostico_inicial?: string; tratamiento?: string;
  requiere_hospitalizacion: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 11: SEGURIDAD AEROPORTUARIA
// ═══════════════════════════════════════════════
export interface SeguridadControl {
  id_control: number; codigo_aeropuerto: string; fecha_control: string;
  tipo_control: 'RAYOS_X'|'REVISION_MANUAL'|'CANES'|'DOCUMENTOS';
  numero_pasajeros_revisados?: number; numero_incidencias?: number;
  supervisor?: string;
}
export interface VisitaSeguridad {
  id_visita: number; codigo_aeropuerto: string; fecha_visita: string;
  nombre_visitante: string; empresa?: string; motivo_visita?: string;
  hora_entrada?: string; hora_salida?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 12: OBJETOS PERDIDOS
// ═══════════════════════════════════════════════
export interface ObjetoPerdido {
  id_objeto: number; descripcion: string; categoria_objeto?: string;
  fecha_reporte: string;
  lugar_encontrado?: 'AEROPUERTO'|'VUELO'|'SALA_ESPERA'|'RESTAURANTE'|'TIENDA'|'ESTACIONAMIENTO'|'BAÑOS';
  estado: 'ENCONTRADO'|'ENTREGADO'|'ELIMINADO'|'EN_PROCESO';
  valor_estimado?: number; encontrado_por?: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 13: ÁREA COMERCIAL
// ═══════════════════════════════════════════════
export interface Concesion {
  id_concesion: number; codigo_aeropuerto: string; nombre_comercial: string;
  tipo_negocio: 'RESTAURANTE'|'TIENDA'|'ALQUILER'|'SERVICIO'|'DUTY_FREE';
  empresa?: string; canon_mensual?: number;
  ubicacion_terminal?: string; activo: number;
}
export interface Venta {
  id_venta: number; id_concesion: number; fecha_venta: string;
  tipo_cliente?: 'PASAJERO'|'VISITANTE'|'TRIPULANTE';
  subtotal?: number; impuestos?: number; total?: number; metodo_pago?: string;
}
export interface SalonVip {
  id_salon: number; codigo_aeropuerto: string; nombre_salon: string;
  ubicacion?: string; capacidad?: number;
  horario_apertura?: string; horario_cierre?: string; activo: number;
}
export interface Estacionamiento {
  id_estacionamiento: number; codigo_aeropuerto: string;
  numero_espacio: string;
  tipo_espacio: 'AUTOMOVIL'|'MOTOCICLETA'|'DISCAPACITADO'|'ELECTRICO'|'CARGA';
  tarifa_por_hora?: number; tarifa_diaria?: number; disponible: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 14: SERVICIOS AL PASAJERO
// ═══════════════════════════════════════════════
export interface HotelCercano {
  id_hotel: number; codigo_aeropuerto: string; nombre_hotel: string;
  categoria?: '1*'|'2*'|'3*'|'4*'|'5*'; distancia_km?: number;
  telefono?: string; tarifa_noche_desde?: number; tiene_shuttle: number; activo: number;
}
export interface QuejaSugerencia {
  id_queja: number; id_pasajero?: number;
  tipo_contacto: 'QUEJA'|'SUGERENCIA'|'FELICITACION'|'RECLAMO';
  fecha_contacto: string; descripcion?: string;
  estado: string; area_relacionada?: string;
}
export interface ProgramaLealtad {
  id_lealtad: number; id_pasajero: number;
  nivel_membresia?: 'BRONCE'|'PLATA'|'ORO'|'PLATINO';
  puntos_acumulados: number; millas_acumuladas: number; activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 15: RECURSOS HUMANOS
// ═══════════════════════════════════════════════
export interface Empleado {
  id: number; codigo: string; nombres: string; apellidos: string;
  cargo: string; departamento: string;
  tipo_contrato: 'PERMANENTE'|'TEMPORAL'|'PRACTICAS'|'CONSULTOR';
  salario_base: number; fecha_contratacion: string;
  email: string; telefono: string; activo: number;
}
export interface Departamento {
  id: number; nombre: string; descripcion?: string;
  ubicacion?: string; presupuesto: number; gerente?: string; activo: number;
}
export interface Asistencia {
  id_asistencia: number; id_empleado: number; fecha: string;
  hora_entrada?: string; hora_salida?: string; horas_trabajadas?: number;
  tipo_jornada?: 'ORDINARIA'|'EXTRA'|'NOCTURNA'|'FESTIVO';
}
export interface Vacacion {
  id: number; empleado: string;
  tipo: 'VACACIONES'|'PERMISO'|'LICENCIA'|'INCAPACIDAD';
  fecha_inicio: string; fecha_fin: string; dias: number;
  estado: 'PENDIENTE'|'AUTORIZADO'|'RECHAZADO'; motivo?: string;
}
export interface Evaluacion {
  id: number; empleado: string; evaluador?: string; periodo: string;
  puntuacion_total: number; productividad: number; calidad: number;
  asistencia: number; trabajo_equipo: number; fecha: string;
}
export interface Capacitacion {
  id: number; nombre_curso: string;
  tipo: 'SEGURIDAD'|'TECNICA'|'ATENCION_CLIENTE'|'IDIOMAS'|'LIDERAZGO';
  duracion_horas: number; costo: number; proveedor?: string;
  fecha_inicio?: string; fecha_fin?: string; activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 16: FINANZAS
// ═══════════════════════════════════════════════
export interface Presupuesto {
  id: number; anio: number; mes: number; concepto: string;
  departamento?: string; monto_asignado: number; monto_ejecutado: number;
  tipo: 'PERSONAL'|'OPERATIVO'|'INVERSION'|'MANTENIMIENTO';
}
export interface Ingreso {
  id: number; fecha: string; concepto: string;
  tipo: 'TASA_EMBARQUE'|'CONCESIONES'|'ESTACIONAMIENTO'|'PUBLICIDAD'|'OTROS';
  monto: number; moneda: string; comprobante?: string;
}
export interface Gasto {
  id: number; fecha: string; concepto: string;
  tipo: 'SERVICIOS'|'SUMINISTROS'|'MANTENIMIENTO'|'SEGURIDAD'|'PERSONAL'|'OTROS';
  departamento?: string; proveedor?: string; monto: number; moneda: string; factura?: string;
}
export interface Proveedor {
  id: number; nombre: string;
  tipo: 'COMBUSTIBLE'|'CATERING'|'MANTENIMIENTO'|'LIMPIEZA'|'SEGURIDAD'|'TECNOLOGIA';
  nit?: string; contacto?: string; telefono?: string;
  email?: string; calificacion: number; activo: number;
}
export interface OrdenCompra {
  id_orden: number; id_proveedor: number; fecha_orden: string;
  fecha_entrega_estimada?: string; estado: string;
  subtotal?: number; impuestos?: number; total?: number;
}
export interface CuentaBancaria {
  id_cuenta: number; banco: string;
  tipo_cuenta: 'MONETARIA'|'AHORRO'|'INVERSION';
  numero_cuenta: string; moneda: string; saldo_actual: number; estado: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 18: MENORES Y ESPECIALES
// ═══════════════════════════════════════════════
export interface Menor {
  id: number; reserva: string; pasajero: string; edad: number;
  vuelo: string; origen: string; destino: string;
  entrega_origen: string; tel_origen: string;
  recoge_destino: string; tel_destino: string;
  estado: 'CONFIRMADO'|'CHECK_IN'|'ABORDADO';
}
export interface Mascota {
  id: number; reserva: string; pasajero: string;
  nombre: string; tipo: 'PERRO'|'GATO'|'AVE';
  raza?: string; peso_kg: number; vuelo: string; destino: string; autorizado: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 19: CARGA
// ═══════════════════════════════════════════════
export interface EnvioCarga {
  id: number; codigo: string; vuelo: string;
  tipo: 'GENERAL'|'PERECEDERA'|'VALORES'|'MEDICAMENTOS'|'PELIGROSA';
  peso_kg: number; bultos: number; contenido: string;
  consignador: string; consignatario: string;
  estado: 'RECIBIDO'|'EN_BODEGA'|'CARGADO'|'EN_VUELO'|'DESCARGADO'|'ENTREGADO'|'ADUANA';
  valor: number;
}
export interface Manifiesto {
  id: number; numero: string; vuelo: string; fecha: string;
  bultos: number; peso_total: number; valor_total: number;
  agente?: string; estado: 'EMITIDO'|'VALIDADO'|'CERRADO';
}
export interface BodegaCarga {
  id_bodega: number; codigo_bodega: string; nombre_bodega?: string;
  ubicacion?: string; capacidad_m3?: number; capacidad_kg?: number;
  tiene_refrigeracion: number; activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 20: MANTENIMIENTO PREDICTIVO
// ═══════════════════════════════════════════════
export interface Sensor {
  id: number; codigo: string;
  tipo: 'MOTOR'|'TEMPERATURA'|'COMBUSTIBLE'|'PRESION'|'VIBRACION'|'ALTITUD'|'VELOCIDAD'|'HIDRAULICO';
  modelo_avion: string; ubicacion?: string; fabricante?: string;
  activo: number; ultima_calibracion?: string;
}
export interface AlertaTecnica {
  id: number; sensor: string;
  nivel: 'INFORMATIVO'|'PREVENTIVO'|'CRITICO'|'EMERGENCIA';
  tipo: string; descripcion: string;
  valor_umbral: number; valor_actual: number; fecha: string; atendida: number;
}
export interface Pieza {
  id: number; codigo: string; nombre: string;
  modelo?: string; stock_actual: number; stock_minimo: number;
  precio: number; ubicacion?: string;
}
export interface OrdenMantenimiento {
  id: number; alerta?: string; pieza?: string; avion: string;
  prioridad: 'BAJA'|'MEDIA'|'ALTA'|'URGENTE';
  descripcion: string; tecnico?: string;
  estado: 'PENDIENTE'|'ASIGNADO'|'EN_PROCESO'|'COMPLETADO'|'CANCELADO';
  fecha_estimada?: string; costo_estimado?: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 21: OPERACIONES TIEMPO REAL
// ═══════════════════════════════════════════════
export interface SlotAeropuerto {
  id_slot: number; id_aerolinea: number; fecha_slot: string;
  tipo_operacion: 'DESPEGUE'|'ATERRIZAJE';
  estado_slot: 'DISPONIBLE'|'ASIGNADO'|'UTILIZADO'|'CANCELADO';
  id_vuelo_asignado?: number;
}
export interface RetrasoTiempoReal {
  id_retraso_tiempo_real: number; id_vuelo: number;
  tipo_retraso: string; causa_especifica?: string;
  minutos_retraso_actuales?: number; notificado_pasajeros: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 22: COMBUSTIBLE
// ═══════════════════════════════════════════════
export interface TanqueCombustible {
  id_tanque: number; codigo_tanque: string; nombre_tanque?: string;
  tipo_combustible?: 'JET_A'|'JET_A1'|'JET_B'|'AVGAS';
  capacidad_litros: number; nivel_actual_litros?: number;
  porcentaje_llenado?: number; activo: number;
}
export interface PedidoCombustible {
  id_pedido_combustible: number; numero_pedido: string; id_vuelo: number;
  cantidad_solicitada_litros: number;
  estado_pedido: 'SOLICITADO'|'APROBADO'|'EN_PROCESO'|'COMPLETADO'|'CANCELADO';
  prioridad?: 'NORMAL'|'ALTA'|'EMERGENCIA';
}
// ═══════════════════════════════════════════════
// MÓDULO 23: AMBIENTAL
// ═══════════════════════════════════════════════
export interface GestionResiduo {
  id_residuo: number; fecha_recoleccion: string;
  tipo_residuo: string; cantidad_kg: number;
  origen: 'TERMINAL'|'VUELOS'|'OFICINAS'|'COMERCIAL'|'MANTENIMIENTO';
  empresa_recolectora?: string; tratamiento?: string; costo_tratamiento?: number;
}
export interface HuellaCarbonoVuelo {
  id_huella_carbono: number; id_vuelo: number;
  combustible_consumido_litros?: number; co2_emitido_kg?: number;
  co2_por_pasajero_kg?: number; distancia_vuelo_km?: number;
  categoria_vuelo?: 'CORTO'|'MEDIO'|'LARGO';
}
// ═══════════════════════════════════════════════
// MÓDULO 24: SEGURIDAD INFORMÁTICA
// ═══════════════════════════════════════════════
export interface UsuarioSistema {
  id_usuario_sistema: number; nombre_usuario: string;
  email_institucional?: string; fecha_creacion?: string;
  bloqueado: number; activo: number; intentos_fallidos: number;
}
export interface RolSistema {
  id_rol_sistema: number; nombre_rol: string;
  descripcion?: string; nivel_jerarquico?: number; activo: number;
}
export interface IncidenteSeguridad {
  id_incidente_seguridad_info: number; fecha_deteccion: string;
  tipo_incidente: string; nivel_gravedad: 'BAJO'|'MEDIO'|'ALTO'|'CRITICO';
  descripcion: string; estado: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 25: MARKETING
// ═══════════════════════════════════════════════
export interface CampanaMarketing {
  id_campana_marketing: number; nombre_campana: string;
  tipo_campana: string; objetivo: string;
  fecha_inicio: string; fecha_fin: string;
  presupuesto?: number; activa: number;
}
export interface SegmentoCliente {
  id_segmento_cliente: number; nombre_segmento: string;
  descripcion?: string; frecuencia_viajes?: string; activo: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 26: GESTIÓN DOCUMENTAL
// ═══════════════════════════════════════════════
export interface Contrato {
  id_contrato: number; numero_contrato: string; nombre_contrato: string;
  tipo_contrato: 'CONCESION'|'ARRENDAMIENTO'|'SERVICIOS'|'SUMINISTRO'|'LABORAL';
  contraparte_nombre: string; fecha_firma: string;
  fecha_inicio: string; fecha_fin: string;
  monto_total?: number; estado: 'VIGENTE'|'VENCIDO'|'TERMINADO'|'SUSPENDIDO'|'RENOVACION';
}
export interface Normativa {
  id_normativa: number; codigo_normativa: string; titulo_normativa: string;
  entidad_emisora?: string;
  ambito_aplicacion?: 'INTERNACIONAL'|'REGIONAL'|'NACIONAL'|'LOCAL';
  fecha_vigencia?: string; activa: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 27: TRANSPORTE TERRESTRE
// ═══════════════════════════════════════════════
export interface RutaTransporte {
  id_ruta_transporte: number; codigo_ruta: string; nombre_ruta: string;
  origen: string; destino: string; distancia_km?: number;
  tipo_ruta?: 'URBANA'|'INTERURBANA'|'AEROPUERTO_HOTEL'|'AEROPUERTO_CENTRO';
  activa: number;
}
export interface VehiculoTransporte {
  id_vehiculo_transporte: number; placa: string;
  tipo_vehiculo: 'BUS'|'MICROBUS'|'TAXI'|'VAN'|'AUTO'|'MOTOCICLETA';
  marca?: string; modelo?: string; capacidad_pasajeros?: number;
  disponible: number; activo: number;
}
export interface ChoferTransporte {
  id_chofer_transporte: number; nombres: string; apellidos: string;
  licencia_conducir: string; fecha_vencimiento_licencia: string;
  telefono?: string; disponible: number; activo: number;
}
export interface ReservaTransporte {
  id_reserva_transporte: number; codigo_reserva_transporte: string;
  id_pasajero: number; lugar_recogida: string; lugar_destino: string;
  fecha_servicio: string;
  estado_reserva: 'CONFIRMADA'|'ASIGNADA'|'COMPLETADA'|'CANCELADA'|'NO_SHOW';
  precio_total?: number;
}
// ═══════════════════════════════════════════════
// MÓDULO 28: EMERGENCIAS
// ═══════════════════════════════════════════════
export interface PlanEmergencia {
  id_plan_emergencia: number; codigo_plan: string; nombre_plan: string;
  tipo_emergencia: string; nivel_activacion: string;
  responsable_activacion?: string; activo: number;
}
export interface EquipoEmergencia {
  id_equipo_emergencia: number; codigo_equipo: string; nombre_equipo: string;
  tipo_equipo: string; ubicacion_habitual?: string;
  estado: 'DISPONIBLE'|'EN_MANTENIMIENTO'|'EN_USO'|'FUERA_SERVICIO'; activo: number;
}
export interface ActivacionEmergencia {
  id_activacion: number; tipo_emergencia: string;
  nivel_activacion: string; lugar_incidente?: string;
  personas_afectadas?: number;
  estado: 'ACTIVA'|'FINALIZADA'; fecha_hora_activacion: string;
}
// ═══════════════════════════════════════════════
// MÓDULO 29: OACI
// ═══════════════════════════════════════════════
export interface ReporteOaci {
  id_reporte_oaci: number;
  tipo_reporte: 'ESTADISTICO'|'SEGURIDAD'|'OPERACIONES'|'INCIDENTES'|'FINANCIERO';
  periodo: 'MENSUAL'|'TRIMESTRAL'|'SEMESTRAL'|'ANUAL';
  fecha_inicio_periodo: string; fecha_fin_periodo: string;
  estado: 'GENERADO'|'ENVIADO'|'RECIBIDO'|'RECHAZADO';
}
export interface CertificacionInternacional {
  id_certificacion_internacional: number; nombre_certificacion: string;
  organismo_certificador: string; fecha_emision: string;
  fecha_vencimiento?: string; numero_certificado: string; activa: number;
}
