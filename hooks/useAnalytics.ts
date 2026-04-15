/**
 * useAnalytics — Hook for ML-powered insights
 * ✅ MIGRADO: Datos reales de backendApi
 */
import { useState, useEffect, useCallback } from 'react';
import { useSesion } from '@/context/session';
import { backendApi } from '@/services/backendApi';
import {
  featureEngineer, fusedRecommend, tracker,
  FusedRecommendations, UserFeatureVector,
  EventType,
} from '@/src/modules/ml/engine';

export function useAnalytics() {
  const { usuario } = useSesion();
  const [features, setFeatures]       = useState<UserFeatureVector | null>(null);
  const [recommendations, setRecs]    = useState<FusedRecommendations | null>(null);
  const [loading, setLoading]         = useState(false);

  const compute = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);

    try {
      // Cargar datos reales del backend en paralelo
      const [reservasRaw, vuelosRaw] = await Promise.allSettled([
        backendApi.reservas.porPasajero(usuario.id),
        backendApi.vuelos.listar(),
      ]);

      const reservas = reservasRaw.status === 'fulfilled' ? reservasRaw.value : [];
      const vuelos   = vuelosRaw.status   === 'fulfilled' ? vuelosRaw.value   : [];

      // Intentar cargar lealtad
      let lealtad: any = null;
      try {
        lealtad = await backendApi.lealtad.porPasajero(usuario.id);
      } catch { /* sin datos de lealtad */ }

      const events = tracker.getSessionEvents(usuario.id);
      const vec = featureEngineer(usuario.id, reservas as any, lealtad, events);
      setFeatures(vec);

      const recs = fusedRecommend(vec, vuelos as any, {
        situacion: 'NORMAL',
        factorDemanda: 1.2,
        horaLocal: new Date().getHours(),
      });
      setRecs(recs);
    } catch (err) {
      console.error('[Analytics] compute error:', err);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => { compute(); }, [compute]);

  const track = useCallback((eventType: EventType, metadata: Record<string, unknown> = {}) => {
    if (!usuario) return;
    tracker.track(usuario.id, eventType, metadata);
  }, [usuario]);

  return { features, recommendations, loading, track, recompute: compute };
}
