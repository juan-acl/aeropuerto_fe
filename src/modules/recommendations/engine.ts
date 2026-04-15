/**
 * Recommendation Engine
 * Based on: analisis_comportamiento, historial_reservas, perfiles_viajero,
 * programa_lealtad, promociones, ofertas_personalizadas, temporadas_vuelo
 */
import { scoreDestino } from '../../core/shared/utils';

export type TipoViajero = 'FRECUENTE' | 'CORPORATIVO' | 'TURISTA' | 'VIP' | 'NUEVO';

export interface RecommendationContext {
  idPasajero: number;
  tipoViajero: TipoViajero;
  nivelLealtad: 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';
  puntosActuales: number;
  historialDestinos: string[];       // from historial_reservas
  busquedasRecientes: string[];      // from analisis_comportamiento
  destinosVistos: string[];          // from analisis_comportamiento
  claseHabitual: string;             // mode from historial_reservas
  factorDemandaActual: number;       // from temporadas_vuelo
  situacion?: 'NORMAL' | 'CANCELACION' | 'RETRASO'; // trigger context
}

export interface RecommendedFlight {
  id_vuelo: number;
  numero_vuelo: string;
  destino: string;
  precio: number;
  score: number;
  razon: string;
  badge?: string; // "Alta demanda", "Mejor precio", "Popular"
}

export interface RecommendedHotel {
  id_hotel: number;
  nombre: string;
  precio_noche: number;
  estrellas: number;
  distancia_km: number;
  tieneConvenio: boolean;
  score: number;
  razon: string;
}

export interface RecommendedService {
  tipo: 'TRANSPORTE' | 'SALON_VIP' | 'EQUIPAJE_EXTRA' | 'UPGRADE' | 'HOTEL' | 'TOUR';
  titulo: string;
  descripcion: string;
  precio?: number;
  badge?: string;
  relevancia: number;
}

export interface RecommendationResult {
  vuelos: RecommendedFlight[];
  hoteles: RecommendedHotel[];
  servicios: RecommendedService[];
  mensajePersonalizado: string;
  ofertaDestacada?: { titulo: string; descuento: number; codigoPromo: string };
}

/**
 * Main recommendation engine function.
 * Implements strategy pattern based on tipoViajero.
 */
export function generarRecomendaciones(
  ctx: RecommendationContext,
  vuelos: Array<{ id_vuelo: number; numero_vuelo: string; aeropuerto_destino: string; plazas_vacias: number }>,
  hoteles: Array<{ id_hotel: number; nombre_hotel: string; precio_noche: number; categoria_estrellas: number; distancia_km: number; convenio_aeropuerto: number }>
): RecommendationResult {

  // ── Score flights based on context ──────────────────────────────────────
  const vuelosScored = vuelos.map(v => {
    let score = 0;
    const dest = v.aeropuerto_destino ?? '';

    // Historical affinity
    score += scoreDestino(dest, ctx.historialDestinos, ctx.busquedasRecientes) * 3;
    // Recently viewed
    if (ctx.destinosVistos.includes(dest)) score += 2;
    // Availability bonus (don't recommend full flights)
    if ((v.plazas_vacias ?? 0) > 20) score += 1;
    if ((v.plazas_vacias ?? 0) < 5) score -= 2;

    // Strategy adjustments
    switch (ctx.tipoViajero) {
      case 'CORPORATIVO':
        // Corporates prefer morning departures (first flights are earlier in mock data)
        if (v.id_vuelo <= 3) score += 2;
        break;
      case 'TURISTA':
        // Tourists prefer affordable / new destinations
        if (!ctx.historialDestinos.includes(dest)) score += 1;
        break;
      case 'FRECUENTE':
        // Frequent flyers prefer familiar routes
        if (ctx.historialDestinos.includes(dest)) score += 3;
        break;
    }

    const razon = score >= 5 ? 'Basado en tus viajes anteriores'
      : score >= 3 ? 'Destino que exploraste recientemente'
      : 'Vuelo popular entre viajeros como tú';

    const badge = ctx.factorDemandaActual > 1.5 ? 'Alta demanda 🔥'
      : (v.plazas_vacias ?? 0) < 10 ? 'Pocas plazas ⚡'
      : undefined;

    return {
      id_vuelo: v.id_vuelo,
      numero_vuelo: v.numero_vuelo ?? `FL-${v.id_vuelo}`,
      destino: dest,
      precio: 285 + Math.floor(score * 15),
      score, razon, badge,
    } as RecommendedFlight;
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  // ── Score hotels ────────────────────────────────────────────────────────
  const hotelesScored = hoteles.map(h => {
    let score = 0;
    if (h.convenio_aeropuerto) score += 3;

    switch (ctx.tipoViajero) {
      case 'CORPORATIVO':
        if ((h.categoria_estrellas ?? 0) >= 4) score += 3;
        break;
      case 'TURISTA':
        if ((h.precio_noche ?? 999) < 100) score += 2;
        break;
      case 'VIP':
      case 'FRECUENTE':
        if ((h.categoria_estrellas ?? 0) >= 4) score += 2;
        if (ctx.nivelLealtad === 'PLATINO' || ctx.nivelLealtad === 'ORO') score += 2;
        break;
    }

    if ((h.distancia_km ?? 99) < 5) score += 2;

    const razon = h.convenio_aeropuerto
      ? `Con convenio especial para pasajeros del aeropuerto`
      : `A ${h.distancia_km ?? '?'} km del aeropuerto`;

    return {
      id_hotel: h.id_hotel,
      nombre: h.nombre_hotel,
      precio_noche: h.precio_noche ?? 0,
      estrellas: h.categoria_estrellas ?? 0,
      distancia_km: h.distancia_km ?? 0,
      tieneConvenio: !!h.convenio_aeropuerto,
      score, razon,
    } as RecommendedHotel;
  }).sort((a, b) => b.score - a.score).slice(0, 4);

  // ── Recommended services based on profile ───────────────────────────────
  const servicios: RecommendedService[] = [];

  // Upgrade suggestion for frequent flyers
  if (ctx.tipoViajero === 'FRECUENTE' || ctx.tipoViajero === 'CORPORATIVO') {
    servicios.push({
      tipo: 'UPGRADE', titulo: 'Mejora a Clase Ejecutiva',
      descripcion: 'Disfruta de mayor comodidad por solo un poco más',
      precio: 180, badge: 'Popular entre viajeros frecuentes', relevancia: 90,
    });
  }

  // VIP lounge for Gold/Platinum
  if (ctx.nivelLealtad === 'ORO' || ctx.nivelLealtad === 'PLATINO') {
    servicios.push({
      tipo: 'SALON_VIP', titulo: 'Acceso al Salón VIP Aurora',
      descripcion: 'Descansa antes de tu vuelo en un ambiente exclusivo',
      precio: 0, badge: 'Incluido con tu nivel ' + ctx.nivelLealtad, relevancia: 95,
    });
  }

  // Transport for everyone
  servicios.push({
    tipo: 'TRANSPORTE', titulo: 'Transporte al aeropuerto',
    descripcion: 'Shuttle, taxi o renta de auto disponibles',
    badge: 'Reserva con anticipación', relevancia: 60,
  });

  // Cancellation context: immediate hotel
  if (ctx.situacion === 'CANCELACION') {
    servicios.unshift({
      tipo: 'HOTEL', titulo: 'Hotel disponible HOY',
      descripcion: 'Tu vuelo fue cancelado. Hoteles disponibles esta noche cerca del aeropuerto.',
      badge: '¡URGENTE — disponibilidad limitada!', relevancia: 100,
    });
  }

  // ── Personalized message ────────────────────────────────────────────────
  const mensajes: Record<TipoViajero, string> = {
    FRECUENTE:  `Bienvenido de vuelta. Tenemos rutas que te encantarán basadas en tus ${ctx.historialDestinos.length} viajes anteriores.`,
    CORPORATIVO:'Su próximo viaje de negocios está a un clic. Vuelos ejecutivos con máxima flexibilidad.',
    TURISTA:    'Descubre destinos únicos a precios especiales. ¡Tu próxima aventura te espera!',
    VIP:        `Estimado pasajero ${ctx.nivelLealtad}, tenemos experiencias exclusivas preparadas para usted.`,
    NUEVO:      '¡Bienvenido a La Aurora! Descubre nuestras ofertas especiales para tu primer vuelo.',
  };

  // ── Featured offer ──────────────────────────────────────────────────────
  const ofertaDestacada = ctx.tipoViajero === 'NUEVO'
    ? { titulo: '20% descuento en tu primer vuelo', descuento: 20, codigoPromo: 'BIENVENIDO20' }
    : ctx.puntosActuales >= 5000
    ? { titulo: `Canjea ${ctx.puntosActuales} puntos`, descuento: Math.floor(ctx.puntosActuales / 1000) * 5, codigoPromo: 'PUNTOS' }
    : undefined;

  return {
    vuelos: vuelosScored,
    hoteles: hotelesScored,
    servicios: servicios.sort((a, b) => b.relevancia - a.relevancia).slice(0, 5),
    mensajePersonalizado: mensajes[ctx.tipoViajero],
    ofertaDestacada,
  };
}

/**
 * Track user behavior (fire-and-forget).
 * Maps to: analisis_comportamiento table.
 */
export function trackEvent(
  type: 'search' | 'view' | 'click' | 'purchase',
  data: { idPasajero?: number; destino?: string; entityId?: number; screen?: string }
): void {
  // In production: POST /api/v1/analytics/track (silent, no await)
  console.debug('[Track]', type, data);
}
