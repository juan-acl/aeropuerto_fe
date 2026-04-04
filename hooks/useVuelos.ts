import { useState, useEffect, useCallback } from 'react';
import { vuelosService } from '@/services/api';
import { VUELOS, PROGRAMAS_VUELO, AEROLINEAS } from '@/services/mockData';

export interface VueloDisponible {
  id_vuelo: number;
  numero_vuelo: string;
  aeropuerto_origen: string;
  aeropuerto_destino: string;
  fecha_vuelo: string;
  hora_salida: string;
  hora_llegada: string;
  duracion_min: number;
  plazas_disponibles: number;
  precio_economica: number;
  precio_ejecutiva: number;
  aerolinea: string;
  logo_aerolinea: string;
  estado: string;
}

export function useVuelos() {
  const [vuelos, setVuelos] = useState(VUELOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (origen: string, destino: string, fecha: string) => {
    setLoading(true); setError(null);
    try {
      const res = await vuelosService.buscar(origen, destino, fecha);
      setVuelos(res as any);
    } catch {
      // fallback to mock
      const filtrados = VUELOS.filter(v =>
        (!origen || v.aeropuerto_origen?.toLowerCase().includes(origen.toLowerCase())) &&
        (!destino || v.aeropuerto_destino?.toLowerCase().includes(destino.toLowerCase())) &&
        (!fecha || v.fecha_vuelo === fecha)
      );
      setVuelos(filtrados.length ? filtrados : VUELOS);
    } finally { setLoading(false); }
  }, []);

  return { vuelos, loading, error, buscar };
}

export function useVueloDetalle(id: number) {
  const vuelo = VUELOS.find(v => v.id_vuelo === id) ?? null;
  const programa = PROGRAMAS_VUELO.find(p => p.id_programa === vuelo?.id_programa);
  const aerolinea = AEROLINEAS.find(a => a.id_aerolinea === programa?.id_aerolinea);
  return { vuelo, programa, aerolinea };
}
