/**
 * useReservas — Flujo de reserva conectado 100% a Oracle via backendApi
 * ✅ MIGRADO: Sin mockData
 */
import { useState, useCallback } from 'react';
import { backendApi } from '@/services/backendApi';
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
        IdVuelo: paso.vuelo?.id_vuelo ?? paso.vuelo?.IdVuelo,
        IdPasajero: usuario?.id,
        NumeroAsiento: paso.asiento,
        ClaseServicio: paso.clase,
        PrecioPagado: paso.clase === 'ECONOMICA' ? 285 : paso.clase === 'EJECUTIVA' ? 650 : 1200,
        Moneda: 'USD',
        MetodoPago: pago?.metodo,
        ReferenciaPago: pago?.referencia,
      };

      const resultado = await backendApi.reservas.crear(payload as any);

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
