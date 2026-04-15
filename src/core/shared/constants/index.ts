/**
 * Constants mirroring Oracle CHECK constraints, ENUMs and business rules.
 */

// ─── Flight states ──────────────────────────────────────────────────────────
export const ESTADO_VUELO = {
  PROGRAMADO: 'PROGRAMADO',
  EN_VUELO: 'EN_VUELO',
  ATERRIZADO: 'ATERRIZADO',
  CANCELADO: 'CANCELADO',
  REPROGRAMADO: 'REPROGRAMADO',
  DEMORADO: 'DEMORADO',
  DESVIADO: 'DESVIADO',
} as const;

export const ESTADO_VUELO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PROGRAMADO:  { label: 'A tiempo',    color: '#2563EB', bg: '#EFF6FF', icon: '🔵' },
  EN_VUELO:    { label: 'En vuelo',    color: '#059669', bg: '#ECFDF5', icon: '🟢' },
  ATERRIZADO:  { label: 'Aterrizado',  color: '#6B7280', bg: '#F9FAFB', icon: '⚫' },
  CANCELADO:   { label: 'Cancelado',   color: '#DC2626', bg: '#FEF2F2', icon: '🔴' },
  REPROGRAMADO:{ label: 'Reprogramado',color: '#7C3AED', bg: '#F5F3FF', icon: '🟣' },
  DEMORADO:    { label: 'Demorado',    color: '#D97706', bg: '#FFFBEB', icon: '🟡' },
  DESVIADO:    { label: 'Desviado',    color: '#EA580C', bg: '#FFF7ED', icon: '🟠' },
};

// ─── Reservation states ─────────────────────────────────────────────────────
export const ESTADO_RESERVA = {
  CONFIRMADA: 'CONFIRMADA',
  PENDIENTE: 'PENDIENTE',
  CANCELADA: 'CANCELADA',
  CHECK_IN: 'CHECK_IN',
  ABORDADO: 'ABORDADO',
  NO_SHOW: 'NO_SHOW',
} as const;

// ─── Service classes ─────────────────────────────────────────────────────────
export const CLASE_SERVICIO = {
  ECONOMICA: 'ECONOMICA',
  EJECUTIVA: 'EJECUTIVA',
  PRIMERA_CLASE: 'PRIMERA_CLASE',
} as const;

export const CLASE_CONFIG: Record<string, { label: string; icon: string; color: string; multiplier: number }> = {
  ECONOMICA:     { label: 'Económica',      icon: '💺', color: '#2563EB', multiplier: 1.0 },
  EJECUTIVA:     { label: 'Ejecutiva',      icon: '🎩', color: '#7C3AED', multiplier: 2.3 },
  PRIMERA_CLASE: { label: 'Primera Clase',  icon: '👑', color: '#D97706', multiplier: 4.2 },
};

// ─── Loyalty levels ──────────────────────────────────────────────────────────
export const NIVEL_LEALTAD = {
  BRONCE:  { label: 'Bronce',  icon: '🥉', color: '#B45309', minPuntos: 0,     maxPuntos: 5000,  descuento: 0,    multiplier: 1.0 },
  PLATA:   { label: 'Plata',   icon: '🥈', color: '#6B7280', minPuntos: 5001,  maxPuntos: 15000, descuento: 3,    multiplier: 1.5 },
  ORO:     { label: 'Oro',     icon: '🥇', color: '#D97706', minPuntos: 15001, maxPuntos: 40000, descuento: 5,    multiplier: 2.0 },
  PLATINO: { label: 'Platino', icon: '💎', color: '#7C3AED', minPuntos: 40001, maxPuntos: Infinity, descuento: 8, multiplier: 3.0 },
};

// ─── Roles ────────────────────────────────────────────────────────────────────
export type RolUsuario =
  | 'CLIENTE' | 'RECEPCIONISTA' | 'CHECKIN' | 'OPERACIONES'
  | 'SEGURIDAD' | 'SUPERVISOR' | 'JEFE_OPERACIONES'
  | 'FINANZAS' | 'RRHH' | 'MANTENIMIENTO' | 'ADMIN';

export const ROL_NIVEL: Record<RolUsuario, number> = {
  CLIENTE: 1, RECEPCIONISTA: 4, CHECKIN: 4, OPERACIONES: 6,
  SEGURIDAD: 7, SUPERVISOR: 7, JEFE_OPERACIONES: 8,
  FINANZAS: 6, RRHH: 5, MANTENIMIENTO: 5, ADMIN: 10,
};

export const ROL_META: Record<RolUsuario, { label: string; color: string; bg: string; icon: string; dept: string }> = {
  CLIENTE:          { label: 'Pasajero / Cliente',     color: '#2563EB', bg: '#EFF6FF', icon: '🧳', dept: 'Público' },
  RECEPCIONISTA:    { label: 'Recepcionista',          color: '#0D9488', bg: '#F0FDFA', icon: '🎫', dept: 'Recepción' },
  CHECKIN:          { label: 'Agente Check-in',        color: '#7C3AED', bg: '#F5F3FF', icon: '✅', dept: 'Check-in' },
  OPERACIONES:      { label: 'Agente de Operaciones',  color: '#0D9488', bg: '#F0FDFA', icon: '🛬', dept: 'Operaciones' },
  SEGURIDAD:        { label: 'Oficial de Seguridad',   color: '#DC2626', bg: '#FEF2F2', icon: '🛡️', dept: 'Seguridad' },
  SUPERVISOR:       { label: 'Supervisor',             color: '#7C3AED', bg: '#F5F3FF', icon: '⭐', dept: 'Supervisión' },
  JEFE_OPERACIONES: { label: 'Jefe de Operaciones',    color: '#0A1628', bg: '#EFF6FF', icon: '✈️', dept: 'Control Aéreo' },
  FINANZAS:         { label: 'Analista Financiero',    color: '#16A34A', bg: '#F0FDF4', icon: '💰', dept: 'Finanzas' },
  RRHH:             { label: 'Recursos Humanos',       color: '#D97706', bg: '#FFFBEB', icon: '👥', dept: 'RRHH' },
  MANTENIMIENTO:    { label: 'Técnico de Mantenimiento',color: '#EA580C', bg: '#FFF7ED', icon: '🔧', dept: 'Mantenimiento' },
  ADMIN:            { label: 'Administrador del Sistema', color: '#B91C1C', bg: '#FEF2F2', icon: '⚙️', dept: 'TI' },
};

// ─── Permission matrix ────────────────────────────────────────────────────────
export interface Permisos {
  verVuelos: boolean;
  buscarVuelos: boolean;
  reservar: boolean;
  verTodasReservas: boolean;
  hacerCheckin: boolean;
  verPasajeros: 'ninguno' | 'propio' | 'limitado' | 'completo';
  verHistorialMedico: boolean;
  verTripulacion: boolean;
  verMantenimiento: boolean;
  verSeguridad: boolean;
  verFinanzas: boolean;
  verSalarios: boolean;
  gestionarEmpleados: boolean;
  verCarga: boolean;
  verCombustible: boolean;
  configurarSistema: boolean;
  verAuditoria: boolean;
  modulosOperativos: number[]; // mod numbers
}

export const PERMISOS_POR_ROL: Record<RolUsuario, Permisos> = {
  CLIENTE: {
    verVuelos: true, buscarVuelos: true, reservar: true, verTodasReservas: false,
    hacerCheckin: true, verPasajeros: 'propio', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: false,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [],
  },
  RECEPCIONISTA: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'limitado', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: false,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [1, 3, 7, 8, 9, 12, 13, 14],
  },
  CHECKIN: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'limitado', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: false,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [7, 8, 9, 12],
  },
  OPERACIONES: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'limitado', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: false,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [1, 3, 5, 7, 8, 9, 12, 13, 14],
  },
  SEGURIDAD: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: false,
    hacerCheckin: false, verPasajeros: 'limitado', verHistorialMedico: true,
    verTripulacion: false, verMantenimiento: false, verSeguridad: true,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [10, 11, 12, 18, 28],
  },
  SUPERVISOR: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'completo', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: true,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [1, 3, 7, 8, 9, 10, 11, 12, 13, 14, 18],
  },
  JEFE_OPERACIONES: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'completo', verHistorialMedico: false,
    verTripulacion: true, verMantenimiento: true, verSeguridad: true,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: true, verCombustible: true, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,19,21,22,27,28],
  },
  FINANZAS: {
    verVuelos: true, buscarVuelos: true, reservar: false, verTodasReservas: true,
    hacerCheckin: false, verPasajeros: 'ninguno', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: false, verSeguridad: false,
    verFinanzas: true, verSalarios: true, gestionarEmpleados: false,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [13, 15, 16, 19, 22, 26],
  },
  RRHH: {
    verVuelos: false, buscarVuelos: false, reservar: false, verTodasReservas: false,
    hacerCheckin: false, verPasajeros: 'ninguno', verHistorialMedico: false,
    verTripulacion: true, verMantenimiento: false, verSeguridad: false,
    verFinanzas: false, verSalarios: true, gestionarEmpleados: true,
    verCarga: false, verCombustible: false, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [6, 15],
  },
  MANTENIMIENTO: {
    verVuelos: true, buscarVuelos: false, reservar: false, verTodasReservas: false,
    hacerCheckin: false, verPasajeros: 'ninguno', verHistorialMedico: false,
    verTripulacion: false, verMantenimiento: true, verSeguridad: false,
    verFinanzas: false, verSalarios: false, gestionarEmpleados: false,
    verCarga: false, verCombustible: true, configurarSistema: false, verAuditoria: false,
    modulosOperativos: [2, 20, 22],
  },
  ADMIN: {
    verVuelos: true, buscarVuelos: true, reservar: true, verTodasReservas: true,
    hacerCheckin: true, verPasajeros: 'completo', verHistorialMedico: true,
    verTripulacion: true, verMantenimiento: true, verSeguridad: true,
    verFinanzas: true, verSalarios: true, gestionarEmpleados: true,
    verCarga: true, verCombustible: true, configurarSistema: true, verAuditoria: true,
    modulosOperativos: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,20,21,22,23,24,25,26,27,28,29],
  },
};

// ─── Checkin rules ────────────────────────────────────────────────────────────
export const CHECKIN_RULES = {
  MAX_HOURS_BEFORE: 24,     // Check-in opens 24h before flight
  MIN_MINUTES_BEFORE: 45,   // Check-in closes 45min before departure
  BAGGAGE_ECONOMY_KG: 23,
  BAGGAGE_BUSINESS_KG: 32,
  CARRY_ON_KG: 10,
};

// ─── Pricing ──────────────────────────────────────────────────────────────────
export const BASE_PRICES_USD: Record<string, number> = {
  GUA_MIA: 385, GUA_BOG: 220, GUA_MEX: 180, GUA_LAX: 520,
  GUA_MAD: 780, GUA_FRS: 85, GUA_MCR: 65,
  DEFAULT: 285,
};

// Penalty calculation for cancellations
export function calculateCancellationPenalty(precio: number, daysBeforeFlight: number): number {
  if (daysBeforeFlight >= 7) return 0;
  if (daysBeforeFlight >= 3) return precio * 0.10;
  if (daysBeforeFlight >= 1) return precio * 0.25;
  return precio * 0.50; // < 24h: 50% penalty
}

// Points earned per flight
export function calculateLoyaltyPoints(precio: number, clase: string, nivelActual: string): number {
  const base = Math.floor(precio * 10);
  const multiplier = NIVEL_LEALTAD[nivelActual as keyof typeof NIVEL_LEALTAD]?.multiplier ?? 1;
  const claseBonus = clase === 'EJECUTIVA' ? 1.5 : clase === 'PRIMERA_CLASE' ? 2 : 1;
  return Math.floor(base * multiplier * claseBonus);
}
