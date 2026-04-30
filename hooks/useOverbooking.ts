/**
 * useOverbooking — Gestión automática de overbooking
 * ✅ MIGRADO: Datos reales de backendApi (vuelos + reservas de Oracle)
 */
import { useState, useCallback, useMemo } from 'react';
import { backendApi } from '@/services/backendApi';

export interface OverbookingCase {
  id_vuelo:          number;
  numero_vuelo:      string;
  destino:           string;
  exceso:            number;
  pasajerosAfectados:number[];
  accion:            'REASIGNADO' | 'UPGRADE' | 'COMPENSACION' | 'PENDIENTE';
  vuelo_alternativo? :number;
  compensacion?:     number;
}

export interface CompensacionOverbooking {
  tipo:      'UPGRADE' | 'VOUCHER_CASH' | 'VUELO_ALT' | 'HOTEL';
  descripcion:string;
  valor:     number;
  prioridad: number;
}

const COMPENSACIONES: CompensacionOverbooking[] = [
  { tipo: 'UPGRADE',     descripcion: 'Upgrade gratuito a clase Ejecutiva',      valor: 0,   prioridad: 1 },
  { tipo: 'VUELO_ALT',   descripcion: 'Vuelo alternativo + Hotel gratis',         valor: 0,   prioridad: 2 },
  { tipo: 'VOUCHER_CASH',descripcion: 'Voucher de USD 300 + viaje reprogramado',  valor: 300, prioridad: 3 },
  { tipo: 'HOTEL',       descripcion: 'Noche en hotel + comidas incluidas',       valor: 0,   prioridad: 4 },
];

export function useOverbooking() {
  const [casos, setCasos] = useState<OverbookingCase[]>([]);
  const [loading, setLoading] = useState(false);

  const detectar = useCallback(async () => {
    setLoading(true);
    try {
      const [vuelos] = await Promise.all([
        backendApi.vuelos.listar(),
      ]);

      const detectados: OverbookingCase[] = [];

      for (const v of vuelos) {
        const capacidad = (v.plazas_vacias ?? 0) + (v.plazas_ocupadas ?? 0);
        if (capacidad <= 0) continue;

        const exceso = (v.plazas_ocupadas ?? 0) - capacidad;
        if (exceso > 0) {
          const altVuelo = vuelos.find(alt =>
            alt.id_vuelo !== v.id_vuelo &&
            alt.aeropuerto_destino === v.aeropuerto_destino &&
            alt.estado_vuelo === 'PROGRAMADO' &&
            (alt.plazas_vacias ?? 0) >= exceso
          );

          detectados.push({
            id_vuelo:          v.id_vuelo,
            numero_vuelo:      v.numero_vuelo ?? `FL-${v.id_vuelo}`,
            destino:           v.aeropuerto_destino ?? '—',
            exceso,
            pasajerosAfectados:[],
            accion:            altVuelo ? 'REASIGNADO' : 'COMPENSACION',
            vuelo_alternativo: altVuelo?.id_vuelo,
            compensacion:      altVuelo ? undefined : 300,
          });
        }
      }

      setCasos(detectados);
      return detectados;
    } catch (e) {
      console.error('[Overbooking] Error detectando:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const procesarOverbooking = useCallback((idVuelo: number, accion: OverbookingCase['accion']) => {
    setCasos(prev => prev.map(c =>
      c.id_vuelo === idVuelo ? { ...c, accion } : c
    ));
  }, []);

  const totalAfectados = useMemo(() =>
    casos.reduce((s, c) => s + c.exceso, 0), [casos]
  );

  return {
    casos, detectar, procesarOverbooking, totalAfectados, loading,
    compensaciones: COMPENSACIONES,
  };
}
