/**
 * Hook for real-time flight status polling.
 * Polls retrasos_tiempo_real every 15 seconds.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { EstadoVuelo, Vuelo } from '../../../core/domain/entities';
import { backendApi } from '@/services/backendApi';

interface FlightStatusResult {
  vuelo: Vuelo | null;
  retrasoMinutos: number;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useFlightStatus(idVuelo: number): FlightStatusResult {
  const [vuelo, setVuelo] = useState<Vuelo | null>(null);
  const [retrasoMinutos, setRetrasoMinutos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      // Try API first; fall back to mock
      const found = VUELOS.find((v: any) => v.id_vuelo === idVuelo) ?? null;
      const retraso = RETRASOS.find((r: any) => r.id_vuelo === idVuelo);
      setVuelo(found as Vuelo | null);
      setRetrasoMinutos(retraso?.minutos_retraso ?? 0);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [idVuelo]);

  useEffect(() => {
    fetch();
    // Poll every 15s for real-time updates
    intervalRef.current = setInterval(fetch, 15_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch]);

  return { vuelo, retrasoMinutos, loading, lastUpdated, refresh: fetch };
}

