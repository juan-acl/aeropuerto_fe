/**
 * PricingEngine — Motor de precios dinámicos
 *
 * Reglas reales aplicadas en orden:
 *  1. Precio base por ruta
 *  2. Multiplicador de clase (Eco / Eje / Primera)
 *  3. Factor de ocupación (scarcity pricing)
 *  4. Factor de temporada (alta / baja)
 *  5. Anticipación de compra (early bird / last minute)
 *  6. Descuento por nivel de lealtad
 *  7. Impuestos (IATA: 16% Guatemala)
 */

export type ClaseServicio = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
export type NivelLealtad  = 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';

export interface PricingInput {
  precioBase:       number;          // tarifa base ruta
  ocupacion:        number;          // 0-1 (plazas_ocupadas / capacidad_total)
  clase:            ClaseServicio;
  diasAnticipacion: number;          // días entre hoy y fecha de vuelo
  factorTemporada:  number;          // de TEMPORADAS_VUELO.factor_demanda (0.5–2.0)
  nivelLealtad?:    NivelLealtad;    // nivel del pasajero logueado
  tienePromo?:      boolean;         // si aplica promoción activa
  codigoPromo?:     string;
}

export interface PricingResult {
  precioBase:        number;
  multiplicadorClase:number;
  factorOcupacion:   number;
  factorTemporada:   number;
  descuentoAnticip:  number;   // % descuento por early bird
  descuentoLealtad:  number;   // % descuento por fidelidad
  descuentoPromo:    number;   // % descuento por código promo
  subtotal:          number;   // antes de impuestos
  impuestos:         number;   // 16% IVA Guatemala
  total:             number;   // precio final a cobrar
  badge?:            string;   // "Precio early bird", "Temporada alta", etc.
  ahorro:            number;   // respecto al precio sin descuentos
}

// ─── Constantes de negocio ────────────────────────────────────────────────────
const CLASE_MULTIPLIER: Record<ClaseServicio, number> = {
  ECONOMICA:     1.0,
  EJECUTIVA:     2.4,
  PRIMERA_CLASE: 4.2,
};

const LEALTAD_DISCOUNT: Record<NivelLealtad, number> = {
  BRONCE:  0.00,   // sin descuento
  PLATA:   0.05,   // 5%
  ORO:     0.10,   // 10%
  PLATINO: 0.15,   // 15%
};

const PROMO_CODES: Record<string, number> = {
  'AURORA20':  0.20,
  'LAUNCH15':  0.15,
  'VIP25':     0.25,
  'FIDELIDAD': 0.12,
};

const TAX_RATE = 0.16; // IVA Guatemala

export function calcularPrecio(input: PricingInput): PricingResult {
  const {
    precioBase, ocupacion, clase, diasAnticipacion,
    factorTemporada, nivelLealtad, tienePromo, codigoPromo,
  } = input;

  // 1. Multiplicador de clase
  const multClase = CLASE_MULTIPLIER[clase];

  // 2. Scarcity factor (yield management)
  let factorOcup = 1.0;
  if      (ocupacion >= 0.95) factorOcup = 1.45;  // últimas plazas
  else if (ocupacion >= 0.85) factorOcup = 1.30;
  else if (ocupacion >= 0.70) factorOcup = 1.15;
  else if (ocupacion >= 0.50) factorOcup = 1.05;
  else if (ocupacion <= 0.20) factorOcup = 0.88;  // vuelo vacío = descuento

  // 3. Factor de temporada (viene de Oracle TEMPORADAS_VUELO)
  const factorTemp = Math.min(Math.max(factorTemporada, 0.5), 2.0);

  // 4. Descuento por anticipación
  let descAnticip = 0;
  if      (diasAnticipacion >= 60) descAnticip = 0.20;  // early bird 60d
  else if (diasAnticipacion >= 30) descAnticip = 0.12;  // early bird 30d
  else if (diasAnticipacion >= 14) descAnticip = 0.06;  // early bird 14d
  else if (diasAnticipacion <= 2)  descAnticip = -0.10; // last minute recargo

  // 5. Descuento lealtad
  const descLealtad = nivelLealtad ? LEALTAD_DISCOUNT[nivelLealtad] : 0;

  // 6. Promo code
  let descPromo = 0;
  if (tienePromo && codigoPromo) {
    descPromo = PROMO_CODES[codigoPromo.toUpperCase()] ?? 0;
  }

  // Precio sin impuestos
  const precioAjustado = precioBase * multClase * factorOcup * factorTemp;
  const totalDescuento  = Math.min(descAnticip + descLealtad + descPromo, 0.45); // cap 45%
  const subtotal = Math.round(precioAjustado * (1 - totalDescuento));

  // Impuestos
  const impuestos = Math.round(subtotal * TAX_RATE);
  const total     = subtotal + impuestos;

  // Ahorro vs precio sin descuentos
  const precioSinDesc = Math.round(precioBase * multClase * factorOcup * factorTemp);
  const ahorro = Math.max(0, precioSinDesc - subtotal);

  // Badge
  let badge: string | undefined;
  if (ocupacion >= 0.85)       badge = '⚡ Últimas plazas';
  else if (descAnticip >= 0.15) badge = '🐦 Early bird';
  else if (factorTemp >= 1.5)   badge = '🔥 Temporada alta';
  else if (factorTemp <= 0.7)   badge = ' Temporada baja';
  else if (descLealtad > 0)     badge = ` Precio ${nivelLealtad}`;

  return {
    precioBase, multiplicadorClase: multClase, factorOcupacion: factorOcup,
    factorTemporada: factorTemp, descuentoAnticip: descAnticip,
    descuentoLealtad: descLealtad, descuentoPromo: descPromo,
    subtotal, impuestos, total, badge, ahorro,
  };
}

// ─── Puntos de lealtad ganados por compra ─────────────────────────────────────
export function calcularPuntosGanados(
  monto: number,
  clase: ClaseServicio,
  nivel: NivelLealtad
): number {
  const BASE_RATE = 10; // 10 puntos por USD
  const CLASE_BONUS: Record<ClaseServicio, number> = {
    ECONOMICA: 1.0, EJECUTIVA: 1.5, PRIMERA_CLASE: 2.0,
  };
  const NIVEL_BONUS: Record<NivelLealtad, number> = {
    BRONCE: 1.0, PLATA: 1.2, ORO: 1.5, PLATINO: 2.0,
  };
  return Math.floor(monto * BASE_RATE * CLASE_BONUS[clase] * NIVEL_BONUS[nivel]);
}

// ─── Penalización por cancelación (IATA) ──────────────────────────────────────
export interface CancelResult {
  penalizacion:    number;
  reembolso:       number;
  porcentaje:      number;
  politica:        string;
  reembolsable:    boolean;
}

export function calcularCancelacion(
  precioPagado: number,
  fechaVuelo: Date,
  tarifaFlexible = true
): CancelResult {
  if (!tarifaFlexible) {
    return {
      penalizacion: precioPagado, reembolso: 0, porcentaje: 100,
      politica: 'Tarifa no reembolsable — sin devolución.',
      reembolsable: false,
    };
  }

  const horasRestantes = (fechaVuelo.getTime() - Date.now()) / 3_600_000;
  let porcentaje: number;
  let politica: string;

  if      (horasRestantes >= 7 * 24) { porcentaje = 0;  politica = 'Cancelación gratuita — más de 7 días.'; }
  else if (horasRestantes >= 3 * 24) { porcentaje = 10; politica = '10% — entre 3 y 7 días antes.'; }
  else if (horasRestantes >= 24)     { porcentaje = 25; politica = '25% — entre 24h y 3 días antes.'; }
  else if (horasRestantes >= 0)      { porcentaje = 50; politica = '50% — menos de 24h antes.'; }
  else                               { porcentaje = 100; politica = 'Vuelo ya pasó — sin reembolso.'; }

  const penalizacion = Math.round(precioPagado * (porcentaje / 100));
  const reembolso    = precioPagado - penalizacion;

  return { penalizacion, reembolso, porcentaje, politica, reembolsable: reembolso > 0 };
}
