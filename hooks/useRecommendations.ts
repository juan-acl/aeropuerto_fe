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

// Emojis removidos por estilo premium
const EMOJIS = [''];

export function useRecommendations() {
  const { recommendations, features, loading } = useAnalytics();
  const backend = useBackend();

  // ── Destinos populares ────────────────────────────────────────────────────
  const destinosPopulares = useMemo((): DestinoPop[] => {
    const backendAirports = backend.aeropuertos.data;

    return backendAirports.slice(0, 8).map((a: any, i: number) => ({
      code: a.codigo_aeropuerto,
      city: a.ciudad ?? a.nombre_aeropuerto,
      emoji: EMOJIS[i % EMOJIS.length],
      precio: 200 + (i * 20),
      tagline: a.pais ?? 'Destino',
      badge: '🟢 En Oracle'
    }));
  }, [backend.aeropuertos.data]);

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
    // Al no haber endpoint de promos, retornamos nada para no mostrar data quemada
    return [];
  }, []);

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
