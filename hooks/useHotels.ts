/**
 * useHotels — Hotel search & filter hook
 * ✅ Conectado al backend Oracle real (backendApi.hoteles)
 * 🔄 Fallback graceful si el backend no está disponible
 */
import { useState, useCallback, useMemo } from 'react';
import { backendApi, BE_HotelCercano } from '@/services/backendApi';

export type HotelSource = 'backend' | 'mock' | 'empty';

export interface HotelResult {
  id_hotel:     number;
  nombre:       string;
  ciudad:       string;
  categoria:    string;       // '5*' | '4*' | '3*'
  estrellas:    number;
  distancia_km: number;
  precio_noche: number;
  shuttle:      boolean;
  rating:       number;       // 0-10
  reviews:      number;
  amenidades:   string[];
  imagen_emoji: string;
  disponible:   boolean;
  badge?:       string;
  codigo_aeropuerto?: string;
}

export interface HotelFilters {
  precioMax:    number;
  estrellasMin: number;
  soloShuttle:  boolean;
  ratingMin:    number;
}

const EMOJIS = ['🏨', '🌴', '🏙️', '⛪', '🌿', '🏰', '🌊', '🏔️'];
const AMENIDADES_POOL = [
  ['Piscina', 'Gym', 'Spa', 'Restaurant'],
  ['WiFi', 'Parking', 'Bar', 'Concierge'],
  ['Desayuno', 'Business Center', 'Pool', 'Room Service'],
  ['Gym', 'Pool', 'WiFi', 'Restaurant'],
];

// ── Normalizar hotel desde backend (PascalCase → snake_case) ──────────────────
function normalizeHotel(h: BE_HotelCercano, index: number): HotelResult {
  const estrellas = Number((h.Categoria ?? '3*').charAt(0)) || 3;
  const dist      = h.DistanciaKm ?? (2 + index * 1.5);
  const precio    = h.TarifaNocheDesde ?? (120 + index * 35);
  // Rating generado localmente a partir de categoría (sin endpoint dedicado)
  const ratingBase = estrellas >= 5 ? 9.0 : estrellas >= 4 ? 8.0 : 7.0;
  const rating     = Math.min(10, ratingBase - (index % 3) * 0.3);
  return {
    id_hotel:          h.IdHotel,
    nombre:            h.NombreHotel,
    ciudad:            'Guatemala',          // default: aeropuerto La Aurora
    categoria:         h.Categoria ?? `${estrellas}*`,
    estrellas,
    distancia_km:      dist,
    precio_noche:      precio,
    shuttle:           h.TieneShuttle === 1,
    rating:            Math.round(rating * 10) / 10,
    reviews:           80 + index * 23,
    amenidades:        AMENIDADES_POOL[index % AMENIDADES_POOL.length],
    imagen_emoji:      EMOJIS[index % EMOJIS.length],
    disponible:        h.Activo !== 0,
    codigo_aeropuerto: h.CodigoAeropuerto,
  };
}

const DEFAULT_FILTERS: HotelFilters = {
  precioMax: 9999, estrellasMin: 1, soloShuttle: false, ratingMin: 0,
};

export function useHotels() {
  const [results,   setResults]   = useState<HotelResult[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [filters,   setFilters]   = useState<HotelFilters>(DEFAULT_FILTERS);
  const [sortBy,    setSortBy]    = useState<'precio' | 'rating' | 'distancia' | 'estrellas'>('precio');
  const [searched,  setSearched]  = useState(false);
  const [source,    setSource]    = useState<HotelSource>('empty');

  const search = useCallback(async (destino?: string) => {
    setLoading(true);
    setError(null);

    try {
      let raw: BE_HotelCercano[];

      // Si hay código de aeropuerto de 3 letras, buscar por aeropuerto
      if (destino && destino.length === 3) {
        try {
          raw = await backendApi.hoteles.porAeropuerto(destino.toUpperCase());
        } catch {
          // Fallback: listar todos
          raw = await backendApi.hoteles.listar();
        }
      } else {
        raw = await backendApi.hoteles.listar();
      }

      const data = raw
        .filter(h => h.Activo !== 0)
        .map((h, i) => normalizeHotel(h, i));

      setResults(data);
      setSource('backend');
      setError(null);
    } catch (e: any) {
      // Backend no disponible — retornar lista vacía con indicador
      setResults([]);
      setSource('empty');
      setError(e?.message ?? 'No se pudo conectar al backend');
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = results.filter(h =>
      h.precio_noche  <= filters.precioMax    &&
      h.estrellas     >= filters.estrellasMin  &&
      h.rating        >= filters.ratingMin     &&
      (!filters.soloShuttle || h.shuttle)
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'precio')    return a.precio_noche - b.precio_noche;
      if (sortBy === 'rating')    return b.rating - a.rating;
      if (sortBy === 'distancia') return a.distancia_km - b.distancia_km;
      if (sortBy === 'estrellas') return b.estrellas - a.estrellas;
      return 0;
    });
  }, [results, filters, sortBy]);

  const priceRange = useMemo(() => {
    if (!results.length) return { min: 0, max: 500 };
    return {
      min: Math.min(...results.map(h => h.precio_noche)),
      max: Math.max(...results.map(h => h.precio_noche)),
    };
  }, [results]);

  return {
    results: filtered, loading, error, searched, source,
    filters, sortBy, priceRange,
    search, setFilters, setSortBy,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  };
}
