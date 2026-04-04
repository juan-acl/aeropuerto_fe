/**
 * Booking flow state machine.
 * Manages the multi-step reservation process:
 * IDLE → SEARCHING → FLIGHT_SELECTED → SEAT_SELECTED → PASSENGER_DATA → PAYMENT → CONFIRMED → ERROR
 */
import { useState, useCallback } from 'react';
import { Vuelo, Reserva } from '../../../core/domain/entities';
import { generateBookingCode } from '../utils';
import { ESTADO_RESERVA } from '../constants';

export type BookingStep =
  | 'IDLE'
  | 'SEARCHING'
  | 'FLIGHT_SELECTED'
  | 'SEAT_SELECTED'
  | 'PASSENGER_DATA'
  | 'PAYMENT'
  | 'CONFIRMED'
  | 'ERROR';

export interface PassengerData {
  nombres: string;
  apellidos: string;
  tipo_documento: 'DPI' | 'PASAPORTE';
  numero_documento: string;
  email: string;
  telefono: string;
  nacionalidad?: string;
  fecha_nacimiento?: string;
}

export interface BookingState {
  step: BookingStep;
  vuelo: Vuelo | null;
  asiento: string | null;
  clase: 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
  pasajero: PassengerData | null;
  codigoPromo: string | null;
  descuentoAplicado: number;
  precio: number;
  reservaConfirmada: Reserva | null;
  error: string | null;
  loading: boolean;
}

const INITIAL_STATE: BookingState = {
  step: 'IDLE',
  vuelo: null, asiento: null, clase: 'ECONOMICA',
  pasajero: null, codigoPromo: null, descuentoAplicado: 0,
  precio: 0, reservaConfirmada: null, error: null, loading: false,
};

export function useBookingFlow() {
  const [state, setState] = useState<BookingState>(INITIAL_STATE);

  const update = (partial: Partial<BookingState>) =>
    setState(prev => ({ ...prev, ...partial }));

  const selectFlight = useCallback((vuelo: Vuelo, precio: number) => {
    update({ vuelo, precio, step: 'FLIGHT_SELECTED', error: null });
  }, []);

  const selectSeat = useCallback((asiento: string, clase: BookingState['clase']) => {
    update({ asiento, clase, step: 'SEAT_SELECTED' });
  }, []);

  const setPassengerData = useCallback((pasajero: PassengerData) => {
    update({ pasajero, step: 'PASSENGER_DATA' });
  }, []);

  const applyPromo = useCallback((codigo: string, descuento: number) => {
    update({ codigoPromo: codigo, descuentoAplicado: descuento });
  }, []);

  const goToPayment = useCallback(() => {
    update({ step: 'PAYMENT' });
  }, []);

  const confirm = useCallback(async (
    idPasajero: number,
    metodoPago: string
  ): Promise<Reserva> => {
    update({ loading: true, error: null });
    try {
      // Simulate API call / use real endpoint when backend is available
      await new Promise(r => setTimeout(r, 1200));

      const reserva: Reserva = {
        id_reserva: Date.now(),
        id_vuelo: state.vuelo!.id_vuelo,
        id_pasajero: idPasajero,
        codigo_reserva: generateBookingCode(),
        fecha_reserva: new Date().toISOString(),
        estado_reserva: ESTADO_RESERVA.CONFIRMADA,
        clase_servicio: state.clase,
        numero_asiento: state.asiento ?? undefined,
        precio_pagado: state.precio - state.descuentoAplicado,
        moneda: 'USD',
        checkin_realizado: 0,
        pasajero_nombre: `${state.pasajero?.nombres} ${state.pasajero?.apellidos}`,
        numero_vuelo: state.vuelo?.numero_vuelo,
      };

      update({ reservaConfirmada: reserva, step: 'CONFIRMED', loading: false });
      return reserva;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el pago.';
      update({ error: msg, step: 'ERROR', loading: false });
      throw err;
    }
  }, [state]);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const goBack = useCallback(() => {
    const stepOrder: BookingStep[] = ['IDLE','SEARCHING','FLIGHT_SELECTED','SEAT_SELECTED','PASSENGER_DATA','PAYMENT','CONFIRMED'];
    const currentIdx = stepOrder.indexOf(state.step);
    if (currentIdx > 0) update({ step: stepOrder[currentIdx - 1] });
  }, [state.step]);

  return { state, selectFlight, selectSeat, setPassengerData, applyPromo, goToPayment, confirm, reset, goBack };
}
