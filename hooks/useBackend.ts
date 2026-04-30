/**
 * useBackend — Hook maestro multi-backend
 * ✅ MIGRADO: Sin fallback a mockData — solo datos reales de Oracle
 *
 * Conecta al backend .NET unificado en :5087.
 * Si el backend no responde: data=[], error=mensaje, source='offline'
 *
 * NOTA: backendApi ya normaliza PascalCase → snake_case internamente,
 *       así que aquí NO se aplica norm/NORM de nuevo.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { backendApi } from '@/services/backendApi';

const POLL_MS = 30_000;

export type BackendStatus = 'checking' | 'online' | 'offline';

interface BackendHealth {
  develop: BackendStatus;
  gerson: BackendStatus;
  modulos: BackendStatus;
}

interface ResourceState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  source: 'backend' | 'offline';
}

function idle<T>(): ResourceState<T> {
  return { data: [], loading: true, error: null, source: 'offline' };
}

export function useBackend() {
  const [health, setHealth] = useState<BackendHealth>({
    develop: 'checking', gerson: 'checking', modulos: 'checking',
  });
  const [aeropuertos, setAe] = useState<ResourceState<any>>(idle());
  const [aerolineas, setAl] = useState<ResourceState<any>>(idle());
  const [hoteles, setHo] = useState<ResourceState<any>>(idle());
  const [empleados, setEmp] = useState<ResourceState<any>>(idle());
  const [temporadas, setTemp] = useState<ResourceState<any>>(idle());
  const [ingresos, setIng] = useState<ResourceState<any>>(idle());
  const [gastos, setGas] = useState<ResourceState<any>>(idle());

  const mounted = useRef(true);
  useEffect(() => { return () => { mounted.current = false; }; }, []);

  // ── Health checks ───────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    // ✅ Backend unificado en :5087 — un solo health check
    const beUrl = process.env.EXPO_PUBLIC_BE_URL ?? 'http://localhost:5087';
    try {
      const res = await fetch(`${beUrl}/api/test`);
      if (!mounted.current) return;
      const status: BackendStatus = res.ok ? 'online' : 'offline';
      setHealth({ develop: status, gerson: status, modulos: status });
    } catch {
      if (!mounted.current) return;
      setHealth({ develop: 'offline', gerson: 'offline', modulos: 'offline' });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, POLL_MS);
    return () => clearInterval(id);
  }, [checkHealth]);


  // ── Load resources — 100% Oracle, 0% mock ───────────────────────────
  // backendApi already normalizes PascalCase → snake_case, so we receive
  // snake_case data directly. No need to call NORM again.
  const loadAll = useCallback(async () => {
    const loadAeropuertos = async () => {
      setAe(s => ({ ...s, loading: true }));
      try {
        const data = await backendApi.aeropuertos.listar();
        const filtered = (data || []).filter((a: any) => a.activo === 1 || a.Activo === 1);
        if (mounted.current) setAe({ data: filtered, loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setAe({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadAerolineas = async () => {
      setAl(s => ({ ...s, loading: true }));
      try {
        const data = await backendApi.aerolineas.listar();
        const filtered = (data || []).filter((a: any) => a.activo === 1 || a.Activo === 1);
        if (mounted.current) setAl({ data: filtered, loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setAl({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadTemporadas = async () => {
      try {
        const data = await backendApi.temporadas.listar();
        const filtered = (data || []).filter((t: any) => {
          const activa = t.activa ?? t.Activa;
          return activa === 1;
        }).map((t: any) => ({
          id_temporada: t.id_temporada ?? t.IdTemporada,
          nombre_temporada: t.nombre_temporada ?? t.NombreTemporada,
          fecha_inicio: t.fecha_inicio ?? t.FechaInicio,
          fecha_fin: t.fecha_fin ?? t.FechaFin,
          factor_demanda: t.factor_demanda ?? t.FactorDemanda ?? 1.0,
        }));
        if (mounted.current) setTemp({ data: filtered, loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setTemp({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadHoteles = async () => {
      setHo(s => ({ ...s, loading: true }));
      try {
        const data = await backendApi.hoteles.listar();
        const filtered = (data || []).filter((h: any) => h.activo === 1 || h.Activo === 1);
        if (mounted.current) setHo({ data: filtered, loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setHo({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadEmpleados = async () => {
      try {
        const data = await backendApi.empleados.listar();
        const filtered = (data || []).filter((e: any) => e.activo === 1 || e.Activo === 1);
        if (mounted.current) setEmp({ data: filtered, loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setEmp({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadIngresos = async () => {
      try {
        const data = await backendApi.ingresos.listar();
        if (mounted.current) setIng({ data: data || [], loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setIng({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    const loadGastos = async () => {
      try {
        const data = await backendApi.gastos.listar();
        if (mounted.current) setGas({ data: data || [], loading: false, error: null, source: 'backend' });
      } catch (e: any) {
        if (mounted.current) setGas({ data: [], loading: false, error: e.message, source: 'offline' });
      }
    };

    await Promise.allSettled([
      loadAeropuertos(), loadAerolineas(), loadTemporadas(),
      loadHoteles(), loadEmpleados(), loadIngresos(), loadGastos(),
    ]);
  }, []);

  useEffect(() => {
    const anyOnline = Object.values(health).some(s => s === 'online');
    if (anyOnline) loadAll();
  }, [health.develop, health.gerson, health.modulos, loadAll]);

  const factorDemandaActual = useMemo(() => {
    if (!temporadas.data.length) return 1.0;
    const now = new Date();
    const active = temporadas.data.find(t => {
      if (!t.fecha_inicio || !t.fecha_fin) return false;
      return new Date(t.fecha_inicio) <= now && now <= new Date(t.fecha_fin);
    });
    return active?.factor_demanda ?? 1.0;
  }, [temporadas.data]);

  const isOnline = Object.values(health).some(s => s === 'online') ? true
    : Object.values(health).every(s => s === 'offline') ? false : null;

  return {
    health, isOnline,
    aeropuertos, aerolineas, hoteles,
    empleados, temporadas, ingresos, gastos,
    factorDemandaActual,
    refresh: { all: loadAll },
  };
}
