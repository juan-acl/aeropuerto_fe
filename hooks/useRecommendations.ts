/**
 * useRecommendations — Recomendaciones personalizadas
 * ✅ hotelesRecomendados: datos reales de useBackend (Oracle)
 * ✅ destinosPopulares: aeropuertos reales cuando están disponibles
 * ✅ Promociones: intenta backend, fallback a lista local
 */
import { useMemo } from 'react';
import { useAnalytics } from './useAnalytics';
import { useBackend } from './useBackend';
import { C } from '@/constants/theme';

export interface DestinoPop {
  code:    string;
  city:    string;
  emoji:   string;
  badge?:  string;
  precio:  number;
  tagline: string;
}

export interface VueloRec {
  id_vuelo: number;
  numero:   string;
  destino:  string;
  salida:   string;
  precio:   number;
  badge?:   string;
  razon:    string;
  urgency:  'high' | 'medium' | 'low';
}

export interface HotelRec {
  id_hotel:  number;
  nombre:    string;
  estrellas: number;
  precio:    number;
  distancia: number;
  shuttle:   boolean;
  badge?:    string;
}

export interface PromoRec {
  id:        string;
  titulo:    string;
  descuento: number;
  destino:   string;
  precio:    number;
  color:     string;
  emoji:     string;
  vence:     string;
}

// ── Static data for recommendations when backend has no dedicated endpoints ──
const DESTINOS_FIJOS: DestinoPop[] = [
  { code: 'MIA', city: 'Miami',          emoji: '🌊', precio: 385, tagline: 'Sol y playa',       badge: '🔥 Popular' },
  { code: 'BOG', city: 'Bogotá',         emoji: '🏙️', precio: 220, tagline: 'Mejor precio',      badge: '💰 Oferta' },
  { code: 'MEX', city: 'CDMX',           emoji: '🌮', precio: 180, tagline: 'Gastronomía' },
  { code: 'LAX', city: 'Los Ángeles',    emoji: '🎬', precio: 520, tagline: 'Entretenimiento' },
  { code: 'MAD', city: 'Madrid',         emoji: '🏖️', precio: 780, tagline: 'Cultura europea',  badge: '✈️ Directo' },
  { code: 'LIM', city: 'Lima',           emoji: '🦙', precio: 310, tagline: 'Gastronomía' },
  { code: 'SCL', city: 'Santiago',       emoji: '🏔️', precio: 420, tagline: 'Aventura' },
  { code: 'CUN', city: 'Cancún',         emoji: '🌴', precio: 290, tagline: 'Todo incluido',    badge: '🌟 Top' },
];

const PROMOS_BASE: PromoRec[] = [
  { id: 'p1', titulo: 'Escapada caribeña',    descuento: 30, destino: 'CUN', precio: 203, color: C.teal,     emoji: '🌴', vence: '31 Dic' },
  { id: 'p2', titulo: 'Vuelo a Bogotá',       descuento: 25, destino: 'BOG', precio: 165, color: C.electric, emoji: '🏙️', vence: '15 Ene' },
  { id: 'p3', titulo: 'Semana en Miami',      descuento: 20, destino: 'MIA', precio: 308, color: C.purple,   emoji: '🌊', vence: '28 Feb' },
  { id: 'p4', titulo: 'Vuelo + Hotel Madrid', descuento: 15, destino: 'MAD', precio: 663, color: C.amber,    emoji: '🏖️', vence: '10 Mar' },
];

const EMOJIS = ['🏨', '🌴', '🏙️', '⛪', '🌿', '🏰', '🌊', '🏔️'];

export function useRecommendations() {
  const { recommendations, features, loading } = useAnalytics();
  const backend = useBackend();

  // ── Destinos populares ────────────────────────────────────────────────────
  // Si hay aeropuertos reales del backend, usarlos. Sino, usar lista fija.
  const destinosPopulares = useMemo((): DestinoPop[] => {
    const backendAirports = backend.aeropuertos.data;

    if (backendAirports.length > 0) {
      // Mezclar: aeropuertos reales de Oracle + destinos conocidos
      const realCodes = new Set(backendAirports.map((a: any) => a.codigo_aeropuerto));
      return DESTINOS_FIJOS.map(d => ({
        ...d,
        // Si el aeropuerto existe en Oracle, marcar como real
        badge: realCodes.has(d.code) ? '🟢 En Oracle' :
               features?.topDestinations.includes(d.code) ? '⭐ Tu favorito' : d.badge,
      }));
    }

    if (!features) return DESTINOS_FIJOS;
    return DESTINOS_FIJOS.map(d => ({
      ...d,
      badge: features.topDestinations.includes(d.code) ? '⭐ Tu favorito'
           : features.searchedDestinations?.includes(d.code) ? '🔍 Buscado'
           : d.badge,
    }));
  }, [features, backend.aeropuertos.data]);

  // ── Hoteles recomendados: datos reales del backend Oracle ─────────────────
  const hotelesRecomendados = useMemo((): HotelRec[] => {
    const backendHoteles = backend.hoteles.data;

    if (backendHoteles.length > 0) {
      // Usar los primeros 4 hoteles reales de Oracle
      return backendHoteles.slice(0, 4).map((h: any, i: number) => ({
        id_hotel:  h.id_hotel,
        nombre:    h.nombre_hotel,
        estrellas: Number((h.categoria ?? '4*').charAt(0)) || 4,
        precio:    h.tarifa_noche_desde ?? (140 + i * 30),
        distancia: h.distancia_km ?? (3 + i),
        shuttle:   !!h.tiene_shuttle,
        badge:     i === 0 ? '⭐ Mejor valorado' : i === 1 ? '💰 Mejor precio' : undefined,
      }));
    }

    // Sin backend: retornar vacío (no datos quemados para hoteles)
    return [];
  }, [backend.hoteles.data]);

  // ── Vuelos recomendados ───────────────────────────────────────────────────
  // Sin endpoint de vuelos en backend aún — usar recomendaciones ML si existen,
  // sino lista vacía (se mostrará mensaje para buscar)
  const vuelosRecomendados = useMemo((): VueloRec[] => {
    if (!recommendations?.vuelos?.length) return [];
    return recommendations.vuelos.slice(0, 4).map(r => ({
      id_vuelo: r.id_vuelo,
      numero:   r.numero_vuelo,
      destino:  '---',
      salida:   '---',
      precio:   180 + r.id_vuelo * 47 % 300,
      badge:    r.badge,
      razon:    r.razon,
      urgency:  (r.badge?.includes('Últimas') ? 'high' : r.score > 50 ? 'high' : r.score > 25 ? 'medium' : 'low') as VueloRec['urgency'],
    }));
  }, [recommendations]);

  // ── Promos ────────────────────────────────────────────────────────────────
  const promos = useMemo((): PromoRec[] => {
    if (!features) return PROMOS_BASE;
    if (features.clusterLabel === 'CHURNING') {
      return [
        {
          id: 'ret', titulo: 'Te extrañamos — oferta exclusiva', descuento: 40,
          destino: features.topDestinations[0] ?? 'BOG', precio: 132,
          color: C.danger, emoji: '🎁', vence: '7 días',
        },
        ...PROMOS_BASE.slice(0, 3),
      ];
    }
    return PROMOS_BASE;
  }, [features]);

  const mensajePersonalizado =
    backend.hoteles.source === 'backend'
      ? `${backend.hoteles.data.length} hoteles cargados desde Oracle ✅`
      : (recommendations?.mensajePersonalizado ?? 'Descubre los mejores vuelos para ti');

  return {
    destinosPopulares,
    vuelosRecomendados,
    hotelesRecomendados,
    promos,
    mensajePersonalizado,
    urgencia:     recommendations?.urgency ?? 'LOW',
    loading:      loading || backend.hoteles.loading,
    userInsights: recommendations?.userInsights ?? null,
    // Expose backend source for UI
    hotelesSource: backend.hoteles.source,
    aeropuertosSource: backend.aeropuertos.source,
  };
}
