/**
 * useFlights — Specialized flight search hook with filtering, sorting, price range
 * ✅ Aerolíneas reales desde backendApi.aerolineas.listar()
 * ✅ Intenta GET /api/vuelos si existe, fallback graceful
 * 🔄 Sin dependencia de mockData
 */
import { useState, useCallback, useMemo } from 'react';
import { backendApi, BE_Aerolinea } from '@/services/backendApi';

export type ClaseVuelo = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
export type SortKey    = 'precio' | 'duracion' | 'salida' | 'llegada';
export type FlightSource = 'backend' | 'mock' | 'empty';

export interface FlightResult {
  id_vuelo:     number;
  numero_vuelo: string;
  origen:       string;
  destino:      string;
  salida:       string;   // HH:MM
  llegada:      string;   // HH:MM
  duracion_min: number;
  plazas:       number;
  precio_eco:   number;
  precio_eje:   number;
  aerolinea:    string;
  cod_iata:     string;
  escalas:      number;
  estado:       string;
}

export interface FlightFilters {
  precioMax:    number;
  soloDirectos: boolean;
  aerolíneas:   string[];
  salidaMin:    string;   // HH:MM
  salidaMax:    string;
  duracionMax:  number;   // minutes
}

const DEFAULT_FILTERS: FlightFilters = {
  precioMax: 9999, soloDirectos: false, aerolíneas: [],
  salidaMin: '00:00', salidaMax: '23:59', duracionMax: 1440,
};

// ── Tipos para endpoint de vuelos (cuando exista) ──────────────────────────────
interface BE_Vuelo {
  IdVuelo:                 number;
  NumeroVuelo?:            string;
  AeropuertoOrigen?:       string;
  AeropuertoDestino?:      string;
  HoraSalidaProgramada?:   string;
  HoraLlegadaProgramada?:  string;
  PlazasVacias?:           number;
  PlazasOcupadas?:         number;
  EstadoVuelo?:            string;
  IdAerolinea?:            number;
  DuracionMinutos?:        number;
}

function buildFromBackendVuelo(
  v: BE_Vuelo,
  aerolineas: BE_Aerolinea[],
  factorDemanda: number = 1.0
): FlightResult {
  const al  = aerolineas.find(a => a.IdAerolinea === v.IdAerolinea);
  const sal = v.HoraSalidaProgramada?.split('T')[1]?.slice(0, 5)  ?? '00:00';
  const arr = v.HoraLlegadaProgramada?.split('T')[1]?.slice(0, 5) ?? '00:00';
  const [sh, sm] = sal.split(':').map(Number);
  const [ah, am] = arr.split(':').map(Number);
  const durCalc   = Math.max(0, (ah * 60 + am) - (sh * 60 + sm));

  const base        = 180 + (v.IdVuelo * 47) % 400;
  const ocupacion   = v.PlazasOcupadas && v.PlazasVacias != null
    ? v.PlazasOcupadas / ((v.PlazasOcupadas ?? 0) + (v.PlazasVacias ?? 30))
    : 0.5;
  const scarcity    = ocupacion > 0.9 ? 1.35 : ocupacion > 0.75 ? 1.18 : ocupacion > 0.5 ? 1.08 : 1.0;
  const finalBase   = Math.round(base * scarcity * factorDemanda);

  return {
    id_vuelo:     v.IdVuelo,
    numero_vuelo: v.NumeroVuelo ?? `FL-${v.IdVuelo}`,
    origen:       v.AeropuertoOrigen  ?? 'GUA',
    destino:      v.AeropuertoDestino ?? '---',
    salida:       sal,
    llegada:      arr,
    duracion_min: (v.DuracionMinutos ?? durCalc) || 120,
    plazas:       v.PlazasVacias ?? 30,
    precio_eco:   finalBase,
    precio_eje:   Math.round(finalBase * 2.4),
    aerolinea:    al?.NombreAerolinea ?? 'Aerolínea',
    cod_iata:     al?.CodigoIata      ?? '??',
    escalas:      0,
    estado:       v.EstadoVuelo ?? 'PROGRAMADO',
  };
}

export function useFlights() {
  const [results,  setResults]  = useState<FlightResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [filters,  setFilters]  = useState<FlightFilters>(DEFAULT_FILTERS);
  const [sortBy,   setSortBy]   = useState<SortKey>('precio');
  const [clase,    setClase]    = useState<ClaseVuelo>('ECONOMICA');
  const [source,   setSource]   = useState<FlightSource>('empty');

  const search = useCallback(async (
    origen: string,
    destino: string,
    fecha: string,
    claseSvc: ClaseVuelo = 'ECONOMICA'
  ) => {
    setLoading(true);
    setError(null);
    setClase(claseSvc);

    try {
      // Cargar aerolíneas reales (siempre intentar primero)
      let aerolineas: BE_Aerolinea[] = [];
      try {
        const rawAl = await backendApi.aerolineas.listar();
        aerolineas = rawAl.filter(a => a.Activo === 1);
      } catch { /* sin aerolíneas, continuar */ }

      // Intentar endpoint de vuelos (puede no existir aún)
      let vuelosData: FlightResult[] = [];
      try {
        const BE_DEVELOP = process.env.EXPO_PUBLIC_BE_URL ?? 'http://localhost:5087';
        const url = `${BE_DEVELOP}/api/vuelos?origen=${origen}&destino=${destino}&fecha=${fecha}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const raw: BE_Vuelo[] = await res.json();
          vuelosData = raw
            .filter(v => v.EstadoVuelo !== 'CANCELADO' && (v.PlazasVacias ?? 1) > 0)
            .map(v => buildFromBackendVuelo(v, aerolineas));
          setSource('backend');
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch {
        // Endpoint de vuelos no existe aún — retornar vacío con mensaje
        setSource('empty');
        setResults([]);
        setError(null);  // no es error, simplemente no hay endpoint de vuelos aún
        setSearched(true);
        setLoading(false);
        return;
      }

      // Si llegamos aquí, hay datos reales de vuelos
      const filtered = vuelosData.filter(v =>
        (!origen  || v.origen  === origen.toUpperCase())  &&
        (!destino || v.destino === destino.toUpperCase())
      );

      setResults(filtered.length ? filtered : vuelosData);
      setError(null);
    } catch (e: any) {
      setResults([]);
      setSource('empty');
      setError(e?.message ?? 'Error al buscar vuelos');
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = results.filter(v => {
      const precio = clase === 'ECONOMICA' ? v.precio_eco : v.precio_eje;
      if (precio > filters.precioMax) return false;
      if (filters.soloDirectos && v.escalas > 0) return false;
      if (filters.aerolíneas.length && !filters.aerolíneas.includes(v.cod_iata)) return false;
      if (v.duracion_min > filters.duracionMax) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const pA = clase === 'ECONOMICA' ? a.precio_eco : a.precio_eje;
      const pB = clase === 'ECONOMICA' ? b.precio_eco : b.precio_eje;
      if (sortBy === 'precio')   return pA - pB;
      if (sortBy === 'duracion') return a.duracion_min - b.duracion_min;
      if (sortBy === 'salida')   return a.salida.localeCompare(b.salida);
      if (sortBy === 'llegada')  return a.llegada.localeCompare(b.llegada);
      return 0;
    });
    return list;
  }, [results, filters, sortBy, clase]);

  const priceRange = useMemo(() => {
    if (!results.length) return { min: 0, max: 1000 };
    const prices = results.map(v => clase === 'ECONOMICA' ? v.precio_eco : v.precio_eje);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [results, clase]);

  const airlines = useMemo(() =>
    [...new Set(results.map(v => v.cod_iata))], [results]
  );

  return {
    results: filtered, loading, error, searched, source,
    filters, sortBy, clase, priceRange, airlines,
    search, setFilters, setSortBy, setClase,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  };
}
