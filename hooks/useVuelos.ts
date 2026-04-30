/**
 * useVuelos.ts — Conectado a backendApi.vuelos (Oracle real vía /api/vuelos)
 * 
 * NOTA: backendApi.vuelos.listar() ya normaliza a snake_case internamente,
 *       así que mapVuelo espera propiedades snake_case.
 */
import { useState, useEffect, useCallback } from 'react';
import { backendApi } from '@/services/backendApi';

export interface VueloDisponible {
  id_vuelo:              number;
  numero_vuelo:          string;
  aeropuerto_origen:     string;
  aeropuerto_destino:    string;
  fecha_vuelo:           string;
  hora_salida:           string;    // HH:MM
  hora_llegada:          string;    // HH:MM
  duracion_min:          number;
  plazas_disponibles:    number;
  precio_economica:      number;
  precio_ejecutiva:      number;
  aerolinea:             string;
  codigo_iata:           string;
  estado:                string;
  logo_aerolinea?:       string;
  fuente:                'oracle' | 'mock';
}

function mapVuelo(v: any): VueloDisponible {
  // Support both snake_case (normalized) and PascalCase (raw) properties
  const horaSalidaRaw = v.hora_salida_programada ?? v.HoraSalidaProgramada;
  const horaLlegadaRaw = v.hora_llegada_programada ?? v.HoraLlegadaProgramada;
  const fechaVueloRaw = v.fecha_vuelo ?? v.FechaVuelo;

  const horaSalida  = horaSalidaRaw
    ? new Date(horaSalidaRaw).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
  const horaLlegada = horaLlegadaRaw
    ? new Date(horaLlegadaRaw).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
  const fechaVuelo  = fechaVueloRaw
    ? new Date(fechaVueloRaw).toISOString().split('T')[0]
    : '';

  return {
    id_vuelo:           v.id_vuelo ?? v.IdVuelo,
    numero_vuelo:       v.numero_vuelo ?? v.NumeroVuelo ?? `FL-${v.id_vuelo ?? v.IdVuelo}`,
    aeropuerto_origen:  v.aeropuerto_origen ?? v.AeropuertoOrigen ?? '',
    aeropuerto_destino: v.aeropuerto_destino ?? v.AeropuertoDestino ?? '',
    fecha_vuelo:        fechaVuelo,
    hora_salida:        horaSalida,
    hora_llegada:       horaLlegada,
    duracion_min:       v.duracion_minutos ?? v.DuracionMinutos ?? 120,
    plazas_disponibles: v.plazas_vacias ?? v.PlazasVacias ?? 0,
    precio_economica:   0,   // Se carga desde tarifas cuando estén disponibles
    precio_ejecutiva:   0,
    aerolinea:          v.nombre_aerolinea ?? v.NombreAerolinea ?? 'Aerolínea',
    codigo_iata:        v.codigo_iata ?? v.CodigoIata ?? '',
    estado:             v.estado_vuelo ?? v.EstadoVuelo ?? 'PROGRAMADO',
    fuente:             'oracle',
  };
}

// ─── Hook de búsqueda de vuelos ──────────────────────────────────────────────
export function useVuelos() {
  const [vuelos, setVuelos]   = useState<VueloDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [fuente, setFuente]   = useState<'oracle' | 'mock' | null>(null);

  const buscar = useCallback(async (origen: string, destino: string, fecha: string) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await backendApi.vuelos.buscar(origen, destino, fecha);
      const mapped = (raw || []).map(mapVuelo);
      setVuelos(mapped);
      setFuente('oracle');
    } catch (e: any) {
      // Fallback: listar todos y filtrar en cliente
      try {
        const all = await backendApi.vuelos.listar();
        const filtrados = (all || []).filter((v: any) => {
          const aorig = (v.aeropuerto_origen ?? v.AeropuertoOrigen ?? '').toUpperCase();
          const adest = (v.aeropuerto_destino ?? v.AeropuertoDestino ?? '').toUpperCase();
          return (!origen  || aorig === origen.toUpperCase()) &&
                 (!destino || adest === destino.toUpperCase());
        });
        setVuelos((filtrados.length ? filtrados : all || []).map(mapVuelo));
        setFuente('oracle');
      } catch {
        // Backend completamente no disponible → mock vacío con mensaje
        setVuelos([]);
        setError('Backend no disponible. Verifica que aeropuerto_be-develop esté corriendo en :5087');
        setFuente('mock');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const listarTodos = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await backendApi.vuelos.listar();
      setVuelos((raw || []).map(mapVuelo));
      setFuente('oracle');
    } catch {
      setVuelos([]);
      setFuente('mock');
    } finally {
      setLoading(false);
    }
  }, []);

  return { vuelos, loading, error, fuente, buscar, listarTodos };
}

// ─── Hook de detalle de vuelo ─────────────────────────────────────────────────
export function useVueloDetalle(id: number) {
  const [vuelo, setVuelo]       = useState<any | null>(null);
  const [tarifas, setTarifas]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const v = await backendApi.vuelos.obtener(id);
        if (!cancelled) setVuelo(v);
        // También intentar cargar tarifas del programa
        try {
          const programId = v.id_programa;
          if (programId) {
            const t = await backendApi.tarifasVuelo.porPrograma(programId);
            if (!cancelled) setTarifas(t || []);
          }
        } catch { /* tarifas opcionales */ }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return { vuelo, tarifas, loading, error };
}
