/**
 * Infrastructure Repository Implementations
 * These adapt the domain contracts to actual data sources (Oracle or Mock).
 * Switch between them by changing which is injected into use cases.
 */
import { axiosInstance as api } from '../api/axiosInstance';
import type {
  IFlightRepository, IBookingRepository, IPassengerRepository,
  ILoyaltyRepository, IPaymentRepository, IAnalyticsRepository,
  FlightSearchParams, CreateBookingInput, PaymentInput, PaymentResult, UserEvent,
} from '../../domain/repositories';
import { backendApi } from '@/services/backendApi';
import type { Reserva } from '../../domain/entities';

// ─── Mock Flight Repository ───────────────────────────────────────────────────
export class MockFlightRepository implements IFlightRepository {
  private vuelos = [...VUELOS] as any[];

  async findAll(params?: FlightSearchParams) {
    return this.vuelos.filter(v => {
      if (params?.origen && v.aeropuerto_origen !== params.origen.toUpperCase()) return false;
      if (params?.destino && v.aeropuerto_destino !== params.destino.toUpperCase()) return false;
      if (params?.estado && v.estado_vuelo !== params.estado) return false;
      return true;
    });
  }

  async findById(id: number) {
    return this.vuelos.find(v => v.id_vuelo === id) ?? null;
  }

  async findAvailableByDestination(destino: string) {
    return this.vuelos.filter(v =>
      v.aeropuerto_destino === destino &&
      v.estado_vuelo === 'PROGRAMADO' &&
      (v.plazas_vacias ?? 0) > 0
    );
  }

  async getAvailability(id: number) {
    const v = this.vuelos.find(v => v.id_vuelo === id);
    return { plazas_vacias: v?.plazas_vacias ?? 0, plazas_ocupadas: v?.plazas_ocupadas ?? 0 };
  }

  async updateStatus(id: number, estado: string) {
    const v = this.vuelos.find(v => v.id_vuelo === id);
    if (v) v.estado_vuelo = estado;
  }

  async decrementSeats(id: number) {
    const v = this.vuelos.find(v => v.id_vuelo === id);
    if (v) { v.plazas_vacias = Math.max(0, (v.plazas_vacias ?? 1) - 1); v.plazas_ocupadas++; }
  }
}

// ─── Mock Booking Repository ──────────────────────────────────────────────────
export class MockBookingRepository implements IBookingRepository {
  private reservas = [...RESERVAS] as any[];

  async create(input: CreateBookingInput) {
    const nueva = {
      id_reserva: Date.now(),
      codigo_reserva: `RES-${Date.now().toString().slice(-6)}`,
      fecha_reserva: new Date().toISOString(),
      estado_reserva: 'CONFIRMADA' as Reserva['estado_reserva'],
      checkin_realizado: 0,
      ...input,
    };
    this.reservas.push(nueva);
    return nueva as unknown as Reserva;
  }

  async findByPassenger(id: number) {
    return this.reservas.filter(r => r.id_pasajero === id);
  }

  async findByCode(codigo: string) {
    return this.reservas.find(r => r.codigo_reserva === codigo) ?? null;
  }

  async findById(id: number) {
    return this.reservas.find(r => r.id_reserva === id) ?? null;
  }

  async cancel(id: number) {
    const r = this.reservas.find(r => r.id_reserva === id);
    if (r) r.estado_reserva = 'CANCELADA';
    return { penalizacion: 0, reembolso: r?.precio_pagado ?? 0 };
  }

  async updateCheckin(id: number) {
    const r = this.reservas.find(r => r.id_reserva === id);
    if (r) { r.checkin_realizado = 1; r.estado_reserva = 'CHECK_IN'; }
  }

  async findAll() { return this.reservas; }
}

// ─── Mock Passenger Repository ────────────────────────────────────────────────
export class MockPassengerRepository implements IPassengerRepository {
  async findById(id: number) { return { id_pasajero: id, nombres: 'Demo', apellidos: 'User' } as any; }
  async findByEmail(email: string) { return null; }
  async findByDocument(doc: string) { return null; }
  async create(data: any) { return { id_pasajero: Date.now(), ...data } as any; }
  async update(id: number, data: any) { return { id_pasajero: id, ...data } as any; }
  async checkFlightBan(id: number) { return false; } // no bans in demo
}

// ─── Mock Loyalty Repository ──────────────────────────────────────────────────
export class MockLoyaltyRepository implements ILoyaltyRepository {
  private programs = [...PROGRAMAS_LEALTAD] as any[];

  async findByPassenger(id: number) {
    return this.programs.find(p => p.id_pasajero === id) ?? null;
  }

  async addPoints(idPasajero: number, puntos: number) {
    let p = this.programs.find(x => x.id_pasajero === idPasajero);
    if (!p) {
      p = { id_lealtad: Date.now(), id_pasajero: idPasajero, nivel_membresia: 'BRONCE', puntos_acumulados: 0 };
      this.programs.push(p);
    }
    p.puntos_acumulados += puntos;
    p.nivel_membresia = this.getLevelByPoints(p.puntos_acumulados);
    return p;
  }

  async redeemPoints(idPasajero: number, puntos: number, beneficio: string) {
    const p = this.programs.find(x => x.id_pasajero === idPasajero);
    if (p) p.puntos_acumulados = Math.max(0, p.puntos_acumulados - puntos);
  }

  getLevelByPoints(puntos: number): string {
    if (puntos >= 40000) return 'PLATINO';
    if (puntos >= 15000) return 'ORO';
    if (puntos >= 5000)  return 'PLATA';
    return 'BRONCE';
  }
}

// ─── Mock Payment Repository (Stripe simulation) ─────────────────────────────
export class MockPaymentRepository implements IPaymentRepository {
  private payments: PaymentResult[] = [];

  async process(input: PaymentInput): Promise<PaymentResult> {
    // Simulate Stripe charge — 95% success rate
    const success = Math.random() > 0.05;
    const result: PaymentResult = {
      id_pago: Date.now(),
      estado: success ? 'COMPLETADO' : 'FALLIDO',
      referencia: `stripe_${Date.now().toString(36)}`,
      monto: input.monto,
    };
    if (!success) throw new Error('El pago fue rechazado por el banco. Intenta con otra tarjeta.');
    this.payments.push(result);
    return result;
  }

  async refund(idPago: number, monto?: number): Promise<PaymentResult> {
    return { id_pago: idPago, estado: 'REEMBOLSADO' as any, referencia: `refund_${idPago}`, monto: monto ?? 0 };
  }

  async findByBooking(idReserva: number): Promise<PaymentResult | null> {
    return this.payments.find(p => p.id_pago === idReserva) ?? null;
  }
}

// ─── Mock Analytics Repository ────────────────────────────────────────────────
export class MockAnalyticsRepository implements IAnalyticsRepository {
  private events: UserEvent[] = [];

  async trackEvent(event: UserEvent) { this.events.push(event); }
  async getEventsByUser(userId: number) { return this.events.filter(e => e.userId === userId); }
  async getConversionRate() { return 0.784; }

  async getTopDestinations(n: number) {
    return [
      { destino: 'BOG', count: 342 }, { destino: 'MEX', count: 289 },
      { destino: 'MIA', count: 211 }, { destino: 'LAX', count: 134 },
    ].slice(0, n);
  }

  async getDailyRevenue(days: number) {
    return Array.from({ length: days }, (_, i) => ({
      fecha: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      total: Math.round(42000 + Math.sin(i / 5) * 8000 + Math.random() * 5000),
    })).reverse();
  }
}

// ─── REST Flight Repository (real backend) ────────────────────────────────────
export class RestFlightRepository implements IFlightRepository {
  async findAll(params?: FlightSearchParams) {
    const qs = new URLSearchParams(params as any).toString();
    const res = await api.get<any[]>(`/vuelos${qs ? '?' + qs : ''}`);
    return res.data;
  }
  async findById(id: number) {
    const res = await api.get<any>(`/vuelos/${id}`);
    return res.data;
  }
  async findAvailableByDestination(destino: string) {
    const res = await api.get<any[]>(`/vuelos?destino=${destino}&estado=PROGRAMADO`);
    return res.data;
  }
  async getAvailability(id: number) {
    const res = await api.get<any>(`/vuelos/${id}/disponibilidad`);
    return res.data;
  }
  async updateStatus(id: number, estado: string) {
    await api.patch(`/vuelos/${id}`, { estado_vuelo: estado });
  }
  async decrementSeats(_id: number) { /* Handled server-side on POST /reservas */ }
}

// ─── Factory — returns mock or REST based on env ──────────────────────────────
const IS_OFFLINE = true; // flip to false when backend is running

export const flightRepo:    IFlightRepository    = IS_OFFLINE ? new MockFlightRepository()    : new RestFlightRepository();
export const bookingRepo:   IBookingRepository   = new MockBookingRepository();
export const passengerRepo: IPassengerRepository = new MockPassengerRepository();
export const loyaltyRepo:   ILoyaltyRepository   = new MockLoyaltyRepository();
export const paymentRepo:   IPaymentRepository   = new MockPaymentRepository();
export const analyticsRepo: IAnalyticsRepository = new MockAnalyticsRepository();

