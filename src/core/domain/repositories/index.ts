/**
 * Domain Repository Interfaces — Pure contracts, no implementation details.
 * These live in the domain layer and define what the app needs from data sources.
 * Implementations (Oracle, mock, REST) are in the infrastructure layer.
 */
import type {
  Vuelo, Reserva, Pasajero, Empleado, ProgramaLealtad,
  HotelCercano, CancelacionVuelo, RetrasoVuelo,
} from '../entities';

// ─── IFlightRepository ────────────────────────────────────────────────────────
export interface FlightSearchParams {
  origen?: string;
  destino?: string;
  fecha?: string;
  estado?: string;
  clase?: string;
}

export interface IFlightRepository {
  findAll(params?: FlightSearchParams): Promise<Vuelo[]>;
  findById(id: number): Promise<Vuelo | null>;
  findAvailableByDestination(destino: string): Promise<Vuelo[]>;
  getAvailability(idVuelo: number): Promise<{ plazas_vacias: number; plazas_ocupadas: number }>;
  updateStatus(idVuelo: number, estado: string): Promise<void>;
  decrementSeats(idVuelo: number): Promise<void>;
}

// ─── IBookingRepository ───────────────────────────────────────────────────────
export interface CreateBookingInput {
  id_vuelo: number;
  id_pasajero: number;
  clase_servicio: string;
  numero_asiento?: string;
  precio_pagado: number;
  moneda: string;
}

export interface IBookingRepository {
  create(input: CreateBookingInput): Promise<Reserva>;
  findByPassenger(idPasajero: number): Promise<Reserva[]>;
  findByCode(codigo: string): Promise<Reserva | null>;
  findById(id: number): Promise<Reserva | null>;
  cancel(id: number): Promise<{ penalizacion: number; reembolso: number }>;
  updateCheckin(id: number): Promise<void>;
  findAll(): Promise<Reserva[]>;
}

// ─── IPassengerRepository ─────────────────────────────────────────────────────
export interface IPassengerRepository {
  findById(id: number): Promise<Pasajero | null>;
  findByEmail(email: string): Promise<Pasajero | null>;
  findByDocument(doc: string): Promise<Pasajero | null>;
  create(data: Omit<Pasajero, 'id_pasajero'>): Promise<Pasajero>;
  update(id: number, data: Partial<Pasajero>): Promise<Pasajero>;
  checkFlightBan(idPasajero: number): Promise<boolean>;
}

// ─── ILoyaltyRepository ───────────────────────────────────────────────────────
export interface ILoyaltyRepository {
  findByPassenger(idPasajero: number): Promise<ProgramaLealtad | null>;
  addPoints(idPasajero: number, puntos: number): Promise<ProgramaLealtad>;
  redeemPoints(idPasajero: number, puntos: number, beneficio: string): Promise<void>;
  getLevelByPoints(puntos: number): string;
}

// ─── IHotelRepository ─────────────────────────────────────────────────────────
export interface IHotelRepository {
  findByAirport(codigo: string): Promise<HotelCercano[]>;
  findAvailable(fecha: string): Promise<HotelCercano[]>;
  findWithConvenio(): Promise<HotelCercano[]>;
}

// ─── IAnalyticsRepository ─────────────────────────────────────────────────────
export interface UserEvent {
  userId: number;
  eventType: string;
  metadata: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface IAnalyticsRepository {
  trackEvent(event: UserEvent): Promise<void>;
  getEventsByUser(userId: number): Promise<UserEvent[]>;
  getConversionRate(): Promise<number>;
  getTopDestinations(n: number): Promise<Array<{ destino: string; count: number }>>;
  getDailyRevenue(days: number): Promise<Array<{ fecha: string; total: number }>>;
}

// ─── IPaymentRepository ───────────────────────────────────────────────────────
export interface PaymentInput {
  idReserva: number;
  monto: number;
  moneda: string;
  metodoPago: string;
  cardToken?: string;  // Stripe token
}

export interface PaymentResult {
  id_pago: number;
  estado: 'COMPLETADO' | 'FALLIDO' | 'PENDIENTE';
  referencia: string;
  monto: number;
}

export interface IPaymentRepository {
  process(input: PaymentInput): Promise<PaymentResult>;
  refund(idPago: number, monto?: number): Promise<PaymentResult>;
  findByBooking(idReserva: number): Promise<PaymentResult | null>;
}
