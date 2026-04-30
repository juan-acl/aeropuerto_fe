/**
 * useFlightStatus.ts — Polling real desde backendApi.vuelos con fallback
 * Polling cada 30s, detecta cambios de estado y dispara notificaciones.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { backendApi, BE_Vuelo } from '@/services/backendApi';
import { notificationStore, NotificationFactory } from '@/src/modules/notifications/store';

export type EstadoVuelo =
  | 'PROGRAMADO' | 'EN_VUELO' | 'ATERRIZADO' | 'CANCELADO' | 'DEMORADO'
  | 'DESVIADO' | 'REPROGRAMADO' | 'EMBARCANDO' | 'PUERTA_CERRADA';

export interface FlightStatusUpdate {
  id_vuelo: number;
  numero_vuelo: string;
  estado_vuelo: EstadoVuelo;
  puerta: number | null;
  hora_salida_real: string | null;
  retraso_min: number;
  ultima_actualizacion: string;
  fuente: 'oracle' | 'mock';
}

const POLL_INTERVAL = 30_000;

function calcNewTime(hhmm: string, addMin: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + addMin;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function mapToFlightStatus(v: any): FlightStatusUpdate {
  const estado = (v.estado_vuelo ?? 'PROGRAMADO') as EstadoVuelo;
  const horaSalida = v.hora_salida_programada
    ? new Date(v.hora_salida_programada).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null;

  return {
    id_vuelo: v.id_vuelo,
    numero_vuelo: v.numero_vuelo ?? `FL-${v.id_vuelo}`,
    estado_vuelo: estado,
    puerta: v.id_puerta_salida ?? null,
    hora_salida_real: horaSalida,
    retraso_min: 0,
    ultima_actualizacion: new Date().toISOString(),
    fuente: 'oracle',
  };
}

export function useFlightStatusList() {
  const [statuses, setStatuses] = useState<FlightStatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fuente, setFuente] = useState<'oracle' | 'mock'>('mock');
  const prevStatuses = useRef<Map<number, EstadoVuelo>>(new Map());

  const fetchStatuses = useCallback(async () => {
    try {
      // Prioridad 1: vuelos del backend real
      const raw = await backendApi.vuelos.listar();
      const updates = raw.map(mapToFlightStatus);

      // Detectar cambios de estado y disparar notificaciones
      updates.forEach(u => {
        const prev = prevStatuses.current.get(u.id_vuelo);
        if (prev && prev !== u.estado_vuelo) {
          if (u.estado_vuelo === 'CANCELADO') {
            notificationStore.add(NotificationFactory.vuleloCancelado({
              numero_vuelo: u.numero_vuelo,
              destino: raw.find(v => v.id_vuelo === u.id_vuelo)?.aeropuerto_destino ?? '—',
            }));
          } else if (u.estado_vuelo === 'DEMORADO' && u.retraso_min > 0) {
            notificationStore.add(NotificationFactory.vueloRetrasado({
              numero_vuelo: u.numero_vuelo,
              minutos: u.retraso_min,
              nueva_hora: u.hora_salida_real ?? '—',
            }));
          } else if (u.estado_vuelo === 'EMBARCANDO') {
            notificationStore.add(NotificationFactory.checkinDisponible(u.numero_vuelo, 1));
          }
        }
        prevStatuses.current.set(u.id_vuelo, u.estado_vuelo);
      });

      setStatuses(updates);
      setLastUpdate(new Date());
      setFuente('oracle');
    } catch {
      // Backend no disponible — mantener último estado sin crash
      setFuente('mock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    const id = setInterval(fetchStatuses, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStatuses]);

  const getStatus = useCallback(
    (id_vuelo: number) => statuses.find(s => s.id_vuelo === id_vuelo) ?? null,
    [statuses]
  );

  return { statuses, loading, lastUpdate, fuente, getStatus, refresh: fetchStatuses };
}

export function useFlightStatus(id_vuelo: number) {
  const { getStatus, loading, lastUpdate, fuente, refresh } = useFlightStatusList();
  return { status: getStatus(id_vuelo), loading, lastUpdate, fuente, refresh };
}
