import { useState, useCallback } from 'react';
import { reservasService } from '@/services/api';
import { RESERVAS } from '@/services/mockData';
import { useSesion } from '@/context/session';

export interface PasoReserva {
  vuelo: any | null;
  asiento: string | null;
  clase: 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
  pasajero: { nombres: string; apellidos: string; documento: string; email: string; telefono: string } | null;
  pago: { metodo: string; referencia: string } | null;
}

const PASO_INICIAL: PasoReserva = {
  vuelo: null, asiento: null, clase: 'ECONOMICA', pasajero: null, pago: null,
};

export function useReservas() {
  const { usuario, agregarReserva } = useSesion();
  const [paso, setPaso] = useState<PasoReserva>(PASO_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<any | null>(null);

  const seleccionarVuelo = (vuelo: any) => setPaso(p => ({ ...p, vuelo }));
  const seleccionarAsiento = (asiento: string, clase: PasoReserva['clase']) =>
    setPaso(p => ({ ...p, asiento, clase }));
  const guardarPasajero = (pasajero: PasoReserva['pasajero']) =>
    setPaso(p => ({ ...p, pasajero }));

  const confirmar = useCallback(async (pago: PasoReserva['pago']) => {
    setLoading(true); setError(null);
    try {
      const payload = {
        id_vuelo: paso.vuelo?.id_vuelo,
        id_pasajero: usuario?.id,
        numero_asiento: paso.asiento,
        clase_servicio: paso.clase,
        precio_pagado: paso.clase === 'ECONOMICA' ? 285 : paso.clase === 'EJECUTIVA' ? 650 : 1200,
        moneda: 'USD',
        metodo_pago: pago?.metodo,
        referencia_pago: pago?.referencia,
      };
      let resultado: any;
      try {
        resultado = await reservasService.crear(payload);
      } catch {
        // Mock response
        resultado = {
          id_reserva: Date.now(),
          codigo_reserva: `RES-${Date.now().toString().slice(-6)}`,
          estado_reserva: 'CONFIRMADA',
          ...payload,
          fecha_reserva: new Date().toISOString(),
        };
      }
      agregarReserva(resultado);
      setExito(resultado);
      setPaso(PASO_INICIAL);
      return resultado;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally { setLoading(false); }
  }, [paso, usuario, agregarReserva]);

  const reiniciar = () => { setPaso(PASO_INICIAL); setExito(null); setError(null); };

  return { paso, loading, error, exito, seleccionarVuelo, seleccionarAsiento, guardarPasajero, confirmar, reiniciar };
}
