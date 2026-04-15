/**
 * Machine Learning Engine — Sistema Híbrido de Recomendaciones
 * Implementa: Content-Based Filtering + Collaborative Filtering (clustering)
 * + Context-Aware recommendations
 *
 * Pipeline:
 *  1. Recolección de eventos (EventTracker)
 *  2. Feature Engineering (featureEngineer)
 *  3. Scoring de usuario (UserScorer)
 *  4. Modelos ML simulados (ContentBased, Collaborative, ContextAware)
 *  5. Ranking y fusión de resultados (RankFusion)
 */

// ─── Event Types ─────────────────────────────────────────────────────────────
export type EventType =
  | 'PAGE_VIEW' | 'FLIGHT_SEARCH' | 'FLIGHT_CLICK' | 'HOTEL_VIEW'
  | 'PROMO_CLICK' | 'BOOKING_START' | 'BOOKING_COMPLETE' | 'BOOKING_ABANDON'
  | 'CHECKIN_START' | 'CHECKIN_COMPLETE' | 'CANCELLATION' | 'REFUND_REQUEST'
  | 'LOYALTY_REDEEM' | 'UPGRADE_ACCEPT' | 'SEARCH_NO_RESULT';

export interface UserEvent {
  userId: number;
  sessionId: string;
  eventType: EventType;
  timestamp: number;
  metadata: Record<string, unknown>;
  screenDuration?: number; // seconds on current screen
}

// ─── Feature Vector ───────────────────────────────────────────────────────────
export interface UserFeatureVector {
  userId: number;
  // Behavioral features
  totalBookings: number;
  totalSpend: number;
  avgTicketPrice: number;
  bookingFrequencyDays: number;   // avg days between bookings
  cancellationRate: number;        // 0-1
  loyaltyLevel: number;            // 0=BRONCE,1=PLATA,2=ORO,3=PLATINO
  loyaltyPoints: number;
  // Travel preferences
  preferredClass: number;          // 0=ECO,1=EJE,2=PRIMERA
  internationalRatio: number;      // 0-1
  avgLeadTimeDays: number;         // booking lead time
  // Context
  topDestinations: string[];
  searchedDestinations: string[];
  avgSessionLengthSec: number;
  clickThroughRate: number;        // clicks / searches
  conversionRate: number;          // bookings / clicks
  // Derived
  userScore: number;               // 0-100 composite score
  clusterLabel: string;            // 'HIGH_VALUE' | 'CHURNING' | 'NEW' | 'REGULAR' | 'VIP'
  churnProbability: number;        // 0-1
  purchaseProbability: number;     // 0-1
  upgradeAffinityScore: number;    // 0-1
}

// ─── Event Tracker (Singleton) ────────────────────────────────────────────────
class EventTracker {
  private events: UserEvent[] = [];
  private sessionId: string = `sess-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  private sessionStart = Date.now();
  private screenStartTime = Date.now();

  track(userId: number, eventType: EventType, metadata: Record<string, unknown> = {}) {
    const event: UserEvent = {
      userId,
      sessionId: this.sessionId,
      eventType,
      timestamp: Date.now(),
      metadata,
      screenDuration: (Date.now() - this.screenStartTime) / 1000,
    };
    this.events.push(event);
    this.screenStartTime = Date.now();

    // In production: POST /api/v1/analytics/events (fire-and-forget)
    // axiosInstance.post('/analytics/events', event).catch(() => {});
    if (__DEV__) {
      console.debug('[ML:Track]', eventType, metadata);
    }
    return event;
  }

  onScreenChange() {
    this.screenStartTime = Date.now();
  }

  getSessionEvents(userId: number) {
    return this.events.filter(e => e.userId === userId);
  }

  getEventsByType(userId: number, type: EventType) {
    return this.events.filter(e => e.userId === userId && e.eventType === type);
  }

  clearSession() {
    this.events = [];
    this.sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    this.sessionStart = Date.now();
  }

  getSessionDurationSec() {
    return (Date.now() - this.sessionStart) / 1000;
  }
}

export const tracker = new EventTracker();

// ─── Feature Engineering ─────────────────────────────────────────────────────
export function featureEngineer(
  userId: number,
  reservas: Array<{ precio_pagado?: number; clase_servicio?: string; tipo_vuelo?: string; fecha_reserva?: string; estado_reserva?: string; aeropuerto_destino?: string }>,
  lealtad: { nivel_membresia?: string; puntos_acumulados?: number } | null,
  sessionEvents: UserEvent[]
): UserFeatureVector {
  const now = Date.now();

  // Booking stats
  const totalBookings = reservas.length;
  const totalSpend = reservas.reduce((s, r) => s + (r.precio_pagado ?? 0), 0);
  const avgTicketPrice = totalBookings > 0 ? totalSpend / totalBookings : 0;
  const cancellations = reservas.filter(r => r.estado_reserva === 'CANCELADA').length;
  const cancellationRate = totalBookings > 0 ? cancellations / totalBookings : 0;

  // Booking frequency
  const sortedDates = reservas
    .filter(r => r.fecha_reserva)
    .map(r => new Date(r.fecha_reserva!).getTime())
    .sort((a, b) => a - b);
  let bookingFrequencyDays = 90; // default: quarterly
  if (sortedDates.length >= 2) {
    const totalDays = (sortedDates[sortedDates.length-1] - sortedDates[0]) / 86400000;
    bookingFrequencyDays = totalDays / (sortedDates.length - 1);
  }

  // Preferences
  const classCounts = { ECONOMICA: 0, EJECUTIVA: 0, PRIMERA_CLASE: 0 };
  reservas.forEach(r => {
    const c = r.clase_servicio as keyof typeof classCounts;
    if (c in classCounts) classCounts[c]++;
  });
  const preferredClass = classCounts.PRIMERA_CLASE > 0 ? 2
    : classCounts.EJECUTIVA > classCounts.ECONOMICA ? 1 : 0;

  const intlBookings = reservas.filter(r => r.tipo_vuelo === 'INTERNACIONAL').length;
  const internationalRatio = totalBookings > 0 ? intlBookings / totalBookings : 0;

  // Top destinations
  const destCount: Record<string, number> = {};
  reservas.forEach(r => {
    const d = r.aeropuerto_destino ?? 'UNKNOWN';
    destCount[d] = (destCount[d] ?? 0) + 1;
  });
  const topDestinations = Object.entries(destCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  // Loyalty
  const NIVEL_TO_NUM: Record<string, number> = { BRONCE: 0, PLATA: 1, ORO: 2, PLATINO: 3 };
  const loyaltyLevel = NIVEL_TO_NUM[lealtad?.nivel_membresia ?? 'BRONCE'] ?? 0;
  const loyaltyPoints = lealtad?.puntos_acumulados ?? 0;

  // Session behavior
  const searchEvents = sessionEvents.filter(e => e.eventType === 'FLIGHT_SEARCH');
  const clickEvents  = sessionEvents.filter(e => e.eventType === 'FLIGHT_CLICK');
  const bookEvents   = sessionEvents.filter(e => e.eventType === 'BOOKING_COMPLETE');
  const searchedDestinations = searchEvents
    .map(e => e.metadata.destino as string)
    .filter(Boolean);

  const clickThroughRate = searchEvents.length > 0 ? clickEvents.length / searchEvents.length : 0;
  const conversionRate   = clickEvents.length > 0 ? bookEvents.length / clickEvents.length : 0;
  const avgSessionLengthSec = sessionEvents.reduce((s, e) => s + (e.screenDuration ?? 0), 0);

  // ── User Composite Score (0-100) ─────────────────────────────────────────
  // Weighted sum of normalized features
  const scoreComponents = {
    frequency:    Math.min(1, (365 / Math.max(bookingFrequencyDays, 1))) * 25, // 25 pts
    spend:        Math.min(1, totalSpend / 5000) * 25,                          // 25 pts
    loyalty:      (loyaltyLevel / 3) * 20,                                      // 20 pts
    conversion:   conversionRate * 15,                                           // 15 pts
    retention:    (1 - cancellationRate) * 15,                                   // 15 pts
  };
  const userScore = Object.values(scoreComponents).reduce((a, b) => a + b, 0);

  // ── Clustering (k-means proxy) ────────────────────────────────────────────
  let clusterLabel: UserFeatureVector['clusterLabel'];
  if (totalBookings === 0 || loyaltyLevel === 0 && totalSpend < 100) {
    clusterLabel = 'NEW';
  } else if (loyaltyLevel >= 3 || (totalSpend > 3000 && cancellationRate < 0.1)) {
    clusterLabel = 'VIP';
  } else if (userScore >= 70) {
    clusterLabel = 'HIGH_VALUE';
  } else if (cancellationRate > 0.3 || bookingFrequencyDays > 180) {
    clusterLabel = 'CHURNING';
  } else {
    clusterLabel = 'REGULAR';
  }

  // ── Probability Predictions ───────────────────────────────────────────────
  // Logistic regression weights (trained offline, hardcoded coefficients)
  const purchaseProbability = sigmoid(
    -1.5
    + 0.8  * conversionRate
    + 0.5  * (1 - cancellationRate)
    + 0.4  * (loyaltyLevel / 3)
    + 0.3  * Math.min(1, clickThroughRate)
    + 0.2  * Math.min(1, totalBookings / 10)
  );

  const churnProbability = sigmoid(
    -1.0
    + 1.2  * cancellationRate
    + 0.8  * Math.max(0, (bookingFrequencyDays - 60) / 60)
    - 0.6  * (loyaltyLevel / 3)
    - 0.4  * conversionRate
  );

  const upgradeAffinityScore = sigmoid(
    -2.0
    + 1.5  * (preferredClass / 2)
    + 1.0  * (loyaltyLevel / 3)
    + 0.5  * Math.min(1, avgTicketPrice / 500)
  );

  return {
    userId, totalBookings, totalSpend, avgTicketPrice, bookingFrequencyDays,
    cancellationRate, loyaltyLevel, loyaltyPoints, preferredClass,
    internationalRatio, avgLeadTimeDays: 14, // simplified
    topDestinations, searchedDestinations,
    avgSessionLengthSec, clickThroughRate, conversionRate,
    userScore, clusterLabel, churnProbability, purchaseProbability, upgradeAffinityScore,
  };
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ─── Content-Based Filtering ──────────────────────────────────────────────────
export function contentBasedFilter(
  features: UserFeatureVector,
  vuelos: Array<{ id_vuelo: number; numero_vuelo?: string; aeropuerto_destino?: string; plazas_vacias?: number; estado_vuelo?: string }>
): Array<{ id_vuelo: number; numero_vuelo: string; score: number; razon: string; badge?: string }> {
  return vuelos
    .filter(v => v.estado_vuelo === 'PROGRAMADO' && (v.plazas_vacias ?? 0) > 0)
    .map(v => {
      const dest = v.aeropuerto_destino ?? '';
      let score = 0;
      let razon = 'Vuelo disponible';
      let badge: string | undefined;

      // Historical match
      const histMatch = features.topDestinations.indexOf(dest);
      if (histMatch === 0) { score += 40; razon = 'Tu destino favorito'; }
      else if (histMatch > 0) { score += 20; razon = 'Destino que ya conoces'; }

      // Search intent match
      if (features.searchedDestinations.includes(dest)) {
        score += 25;
        razon = 'Estuviste buscando este destino';
        badge = '🔍 Buscado recientemente';
      }

      // Class preference alignment
      if (features.preferredClass >= 1 && score > 30) { score += 10; }

      // International traveler
      if (features.internationalRatio > 0.7 && dest !== 'GUA') { score += 10; }

      // Scarcity signal
      const scarcity = 1 - ((v.plazas_vacias ?? 30) / 162);
      if (scarcity > 0.85) { score += 15; badge = '⚡ Últimas plazas'; }
      else if (scarcity > 0.7) { score += 8; badge = '🔥 Alta demanda'; }

      return {
        id_vuelo: v.id_vuelo,
        numero_vuelo: v.numero_vuelo ?? `FL-${v.id_vuelo}`,
        score, razon, badge,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

// ─── Collaborative Filtering (simulated with cluster-based profiles) ──────────
const CLUSTER_PROFILES: Record<string, {
  preferredDestinations: string[];
  avgSpend: number;
  classDistribution: string;
  topFeatures: string[];
}> = {
  VIP:        { preferredDestinations: ['MAD','MIA','LAX'], avgSpend: 1500, classDistribution: 'EJECUTIVA', topFeatures: ['upgrade','vip_lounge','fast_track'] },
  HIGH_VALUE: { preferredDestinations: ['BOG','MEX','MIA'], avgSpend: 600,  classDistribution: 'MIXTA',    topFeatures: ['loyalty','early_checkin','meal'] },
  REGULAR:    { preferredDestinations: ['BOG','MEX'],        avgSpend: 280,  classDistribution: 'ECONOMICA',topFeatures: ['price','promotion','basic'] },
  NEW:        { preferredDestinations: ['BOG','MEX'],        avgSpend: 200,  classDistribution: 'ECONOMICA',topFeatures: ['popular','easy','promo_first'] },
  CHURNING:   { preferredDestinations: ['FRS'],              avgSpend: 150,  classDistribution: 'ECONOMICA',topFeatures: ['retention_offer','discount'] },
};

export function collaborativeFilter(
  features: UserFeatureVector
): { recommendations: string[]; suggestedClass: string; expectedSpend: number; cross_sell: string[] } {
  const profile = CLUSTER_PROFILES[features.clusterLabel] ?? CLUSTER_PROFILES.REGULAR;

  // Filter out destinations user already knows
  const newDests = profile.preferredDestinations
    .filter(d => !features.topDestinations.includes(d))
    .slice(0, 3);

  return {
    recommendations: [...newDests, ...profile.preferredDestinations.slice(0, 2)],
    suggestedClass: profile.classDistribution,
    expectedSpend: profile.avgSpend,
    cross_sell: profile.topFeatures,
  };
}

// ─── Context-Aware Recommendations ────────────────────────────────────────────
export function contextAwareRecommend(
  features: UserFeatureVector,
  context: { situacion: 'NORMAL' | 'CANCELACION' | 'RETRASO'; factorDemanda: number; horaLocal: number }
): { urgency: string; priority: string[]; message: string } {
  if (context.situacion === 'CANCELACION') {
    return {
      urgency: 'HIGH',
      priority: ['VUELO_ALTERNATIVO', 'HOTEL', 'TRANSPORTE'],
      message: 'Tu vuelo fue cancelado. Te mostramos las mejores alternativas disponibles ahora mismo.',
    };
  }
  if (context.situacion === 'RETRASO') {
    return {
      urgency: 'MEDIUM',
      priority: ['SALON_VIP', 'RESTAURANTE', 'WIFI'],
      message: 'Tu vuelo está retrasado. Aprovecha el tiempo en el aeropuerto.',
    };
  }
  if (context.factorDemanda > 1.5) {
    return {
      urgency: 'MEDIUM',
      priority: ['VUELO', 'PROMO_EARLY'],
      message: '¡Temporada alta! Los precios subirán pronto. Reserva ahora.',
    };
  }
  if (context.horaLocal < 9) {
    return {
      urgency: 'LOW',
      priority: ['DESAYUNO', 'VUELO_MANANA'],
      message: 'Buenos días. Revisa los vuelos disponibles hoy.',
    };
  }
  return {
    urgency: 'LOW',
    priority: ['VUELO', 'HOTEL', 'PROMO'],
    message: features.clusterLabel === 'NEW'
      ? '¡Bienvenido! Descubre los destinos más populares.'
      : 'Recomendaciones personalizadas para ti.',
  };
}

// ─── Rank Fusion (combine all model outputs) ──────────────────────────────────
export interface FusedRecommendations {
  vuelos: Array<{ id_vuelo: number; numero_vuelo: string; score: number; razon: string; badge?: string }>;
  destinosSugeridos: string[];
  serviciosCrossSell: string[];
  mensajePersonalizado: string;
  urgency: string;
  userInsights: {
    score: number;
    cluster: string;
    churnRisk: string;
    purchaseReady: boolean;
    upgradeCandidate: boolean;
  };
}

export function fusedRecommend(
  features: UserFeatureVector,
  vuelos: any[],
  context: Parameters<typeof contextAwareRecommend>[1]
): FusedRecommendations {
  const cbf  = contentBasedFilter(features, vuelos);
  const cf   = collaborativeFilter(features);
  const ctx  = contextAwareRecommend(features, context);

  // Merge CBF + CF scores with weights: CBF=0.6, CF=0.4
  const merged = cbf.map(v => ({
    ...v,
    score: v.score * 0.6 + (cf.recommendations.includes(v.numero_vuelo) ? 20 : 0),
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  return {
    vuelos: merged,
    destinosSugeridos: cf.recommendations,
    serviciosCrossSell: cf.cross_sell,
    mensajePersonalizado: ctx.message,
    urgency: ctx.urgency,
    userInsights: {
      score: Math.round(features.userScore),
      cluster: features.clusterLabel,
      churnRisk: features.churnProbability > 0.6 ? 'HIGH'
        : features.churnProbability > 0.3 ? 'MEDIUM' : 'LOW',
      purchaseReady: features.purchaseProbability > 0.5,
      upgradeCandidate: features.upgradeAffinityScore > 0.6,
    },
  };
}

// Re-export tracker for convenience
export { EventTracker };
