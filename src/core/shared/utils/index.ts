/**
 * Utility functions — format, validate, transform.
 * Pure functions, no side effects, easily testable.
 */

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmt = {
  /** Format currency with locale */
  moneda: (amount: number, currency = 'USD', locale = 'es-GT') =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount),

  /** Format date from ISO string */
  fecha: (iso: string, locale = 'es-GT') => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  },

  /** Extract HH:MM from ISO timestamp */
  hora: (iso: string) => {
    if (!iso) return '--:--';
    return iso.includes('T') ? iso.split('T')[1]?.slice(0, 5) ?? '--:--' : iso.slice(0, 5);
  },

  /** Format flight duration in hours and minutes */
  duracion: (minutos: number) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },

  /** Format large numbers with locale separators */
  numero: (n: number) => n.toLocaleString('es-GT'),

  /** Format KG weight */
  peso: (kg: number) => `${kg.toLocaleString('es-GT')} kg`,

  /** Relative time (e.g. "hace 2 horas") */
  relativo: (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h}h`;
    const d = Math.floor(h / 24);
    return `hace ${d} día${d !== 1 ? 's' : ''}`;
  },

  /** Capitalize first letter */
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),

  /** Mask sensitive data (e.g. card number) */
  maskCard: (num: string) => `•••• •••• •••• ${num.slice(-4)}`,
  maskEmail: (email: string) => {
    const [user, domain] = email.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
  },
};

// ─── Validators ───────────────────────────────────────────────────────────────
export const v = {
  required: (s: string | undefined | null): boolean =>
    typeof s === 'string' && s.trim().length > 0,

  email: (s: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),

  dpi: (s: string): boolean =>
    /^\d{13}$/.test(s.replace(/\s|-/g, '')),

  pasaporte: (s: string): boolean =>
    /^[A-Z]{1,2}\d{5,9}$/i.test(s.trim()),

  telefono: (s: string): boolean =>
    /^[\d\s\+\-\(\)]{8,15}$/.test(s),

  fecha: (s: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime()),

  codigoReserva: (s: string): boolean =>
    /^RES-\d{6}$/i.test(s.trim()),

  minLen: (s: string, n: number): boolean => s.length >= n,
  maxLen: (s: string, n: number): boolean => s.length <= n,
  numeric: (s: string): boolean => !isNaN(Number(s)) && s.trim() !== '',
  positivo: (n: number): boolean => n > 0,
};

// ─── Reservation code generator ───────────────────────────────────────────────
export function generateBookingCode(): string {
  const ts = Date.now().toString().slice(-6);
  return `RES-${ts}`;
}

// ─── Seat availability ────────────────────────────────────────────────────────
export function calcularOcupacion(plazasOcupadas: number, totalPlazas: number): {
  porcentaje: number;
  disponibles: number;
  estado: 'DISPONIBLE' | 'POCAS' | 'CASI_LLENO' | 'COMPLETO';
} {
  const pct = totalPlazas > 0 ? Math.round((plazasOcupadas / totalPlazas) * 100) : 0;
  const disponibles = totalPlazas - plazasOcupadas;
  const estado = disponibles === 0 ? 'COMPLETO'
    : pct >= 90 ? 'CASI_LLENO'
    : pct >= 70 ? 'POCAS'
    : 'DISPONIBLE';
  return { porcentaje: pct, disponibles, estado };
}

// ─── Dynamic pricing ──────────────────────────────────────────────────────────
export function calcularPrecioDinamico(
  precioBase: number,
  factorDemanda: number,  // temporadas_vuelo.factor_demanda
  ocupacion: number,       // 0-100
  diasAnticipacion: number // days before flight
): number {
  let precio = precioBase * factorDemanda;
  // Increase price as seats fill up
  if (ocupacion >= 90) precio *= 1.40;
  else if (ocupacion >= 75) precio *= 1.20;
  else if (ocupacion >= 50) precio *= 1.05;
  // Early booking discount
  if (diasAnticipacion >= 30) precio *= 0.85;
  else if (diasAnticipacion >= 14) precio *= 0.92;
  else if (diasAnticipacion < 3) precio *= 1.30; // last-minute surcharge
  return Math.round(precio * 100) / 100;
}

// ─── Check-in eligibility ─────────────────────────────────────────────────────
export function validarElegibilidadCheckin(
  horaSalida: string,
  estado: string,
  checkinRealizado: boolean
): { elegible: boolean; razon?: string } {
  if (checkinRealizado) return { elegible: false, razon: 'El check-in ya fue realizado.' };
  if (estado === 'CANCELADO') return { elegible: false, razon: 'El vuelo fue cancelado.' };
  if (estado === 'ATERRIZADO') return { elegible: false, razon: 'El vuelo ya aterrizó.' };

  const salida = new Date(horaSalida).getTime();
  const ahora = Date.now();
  const diffMin = (salida - ahora) / 60000;

  if (diffMin > 24 * 60) return { elegible: false, razon: `El check-in abre 24 horas antes del vuelo.` };
  if (diffMin < 45) return { elegible: false, razon: 'El check-in cerró (menos de 45 minutos para el vuelo).' };

  return { elegible: true };
}

// ─── Recommendation scoring ───────────────────────────────────────────────────
export function scoreDestino(
  destino: string,
  historial: string[],
  busquedas: string[]
): number {
  let score = 0;
  historial.forEach(h => { if (h === destino) score += 3; });
  busquedas.forEach(b => { if (b.toLowerCase().includes(destino.toLowerCase())) score += 1; });
  return score;
}
