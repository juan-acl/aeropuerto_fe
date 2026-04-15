/**
 * useLiveData — Hook genérico para cargar datos REALES del backend Oracle
 *
 * Reemplaza toda dependencia de mockData con llamadas a backendApi.
 * Todos los screens/hooks deben usar esto en lugar de importar constantes mock.
 *
 * Uso:
 *   const { data, loading, error, refetch } = useLiveData(() => backendApi.vuelos.listar());
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface LiveDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLiveData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: any[] = []
): LiveDataResult<T> {
  const [data, setData]       = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (e: any) {
      if (mounted.current) {
        setError(e.message ?? 'Error de conexión con el backend');
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mounted.current = true;
    refetch();
    return () => { mounted.current = false; };
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * useLiveMulti — Carga múltiples recursos en paralelo
 *
 * Uso:
 *   const { tanques, pedidos, loading } = useLiveMulti({
 *     tanques: () => backendApi.combustible.tanques.listar(),
 *     pedidos: () => backendApi.combustible.pedidos.listar(),
 *   });
 */
export function useLiveMulti<T extends Record<string, any>>(
  fetchers: { [K in keyof T]: () => Promise<T[K]> },
  fallbacks?: { [K in keyof T]?: T[K] }
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const keys = Object.keys(fetchers) as (keyof T)[];
  const initial = {} as T;
  keys.forEach(k => { (initial as any)[k] = fallbacks?.[k] ?? []; });

  const [data, setData]       = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.allSettled(
        keys.map(async k => ({ key: k, value: await fetchers[k]() }))
      );
      const result = { ...initial };
      entries.forEach((e, i) => {
        if (e.status === 'fulfilled') {
          (result as any)[e.value.key] = e.value.value;
        }
      });
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, []);

  return { data, loading, error, refetch };
}
