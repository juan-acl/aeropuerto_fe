/**
 * Domain Use Cases — Pure business logic, independent of framework/DB.
 * Each use case represents one application operation with its own validation,
 * error handling and business rules.
 */
import type {
  IFlightRepository, IBookingRepository, IPassengerRepository,
  ILoyaltyRepository, IPaymentRepository, CreateBookingInput, PaymentInput,
} from '../repositories';

// ── Helpers ──────────────────────────────────────────────────────────────────
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

// ── UC-001: Search Available Flights ─────────────────────────────────────────
export class SearchFlightsUseCase {
  constructor(private flights: IFlightRepository) {}

  async execute(params: { origen: string; destino: string; fecha: string; clase?: string }) {
    if (!params.origen || !params.destino) {
      throw new DomainError('Origen y destino son requeridos.', 'VALIDATION_ERROR');
    }
    if (params.origen === params.destino) {
      throw new DomainError('Origen y destino no pueden ser iguales.', 'SAME_AIRPORTS');
    }
    if (!params.fecha || isNaN(new Date(params.fecha).getTime())) {
      throw new DomainError('Fecha inválida.', 'INVALID_DATE');
    }
    if (new Date(params.fecha) < new Date()) {
      throw new DomainError('La fecha del vuelo no puede estar en el pasado.', 'PAST_DATE');
    }
    return this.flights.findAll(params);
  }
}

// ── UC-002: Create Booking ────────────────────────────────────────────────────
export class CreateBookingUseCase {
  constructor(
    private flights: IFlightRepository,
    private bookings: IBookingRepository,
    private passengers: IPassengerRepository,
    private loyalty: ILoyaltyRepository
  ) {}

  async execute(input: CreateBookingInput): Promise<{ reserva: any; puntosGanados: number }> {
    // 1. Validate flight availability
    const avail = await this.flights.getAvailability(input.id_vuelo);
    if (avail.plazas_vacias <= 0) {
      throw new DomainError('El vuelo no tiene plazas disponibles.', 'NO_SEATS', 409);
    }

    // 2. Check passenger flight ban
    const banned = await this.passengers.checkFlightBan(input.id_pasajero);
    if (banned) {
      throw new DomainError('El pasajero tiene una prohibición de vuelo activa.', 'PASSENGER_BANNED', 403);
    }

    // 3. Create booking
    const reserva = await this.bookings.create(input);

    // 4. Decrement seats
    await this.flights.decrementSeats(input.id_vuelo);

    // 5. Award loyalty points
    const basePoints = Math.floor((input.precio_pagado ?? 0) * 10);
    const claseMultiplier = input.clase_servicio === 'PRIMERA_CLASE' ? 2
      : input.clase_servicio === 'EJECUTIVA' ? 1.5 : 1;
    const puntosGanados = Math.floor(basePoints * claseMultiplier);

    try {
      await this.loyalty.addPoints(input.id_pasajero, puntosGanados);
    } catch { /* Non-critical — don't fail booking if points fail */ }

    return { reserva, puntosGanados };
  }
}

// ── UC-003: Cancel Booking with Refund ────────────────────────────────────────
export class CancelBookingUseCase {
  constructor(
    private bookings: IBookingRepository,
    private flights: IFlightRepository
  ) {}

  /** Calculate penalty based on days before departure */
  private calcPenalty(precioPagado: number, fechaReserva: Date): number {
    const now = Date.now();
    const flightMs = fechaReserva.getTime();
    const hoursUntilFlight = (flightMs - now) / 3_600_000;

    if (hoursUntilFlight >= 7 * 24) return 0;             // > 7 days: free
    if (hoursUntilFlight >= 3 * 24) return precioPagado * 0.10; // 3-7 days: 10%
    if (hoursUntilFlight >= 24)     return precioPagado * 0.25; // 1-3 days: 25%
    return precioPagado * 0.50;                             // < 24h: 50%
  }

  async execute(codigoReserva: string): Promise<{
    penalizacion: number; reembolso: number; mensaje: string;
  }> {
    const reserva = await this.bookings.findByCode(codigoReserva);
    if (!reserva) {
      throw new DomainError('Reserva no encontrada.', 'NOT_FOUND', 404);
    }
    if (reserva.estado_reserva === 'CANCELADA') {
      throw new DomainError('La reserva ya está cancelada.', 'ALREADY_CANCELLED', 409);
    }
    if (reserva.estado_reserva === 'ABORDADO') {
      throw new DomainError('No se puede cancelar: el pasajero ya abordó.', 'ALREADY_BOARDED', 409);
    }

    const penalizacion = this.calcPenalty(
      reserva.precio_pagado ?? 0,
      new Date(reserva.fecha_reserva)
    );
    const reembolso = (reserva.precio_pagado ?? 0) - penalizacion;

    await this.bookings.cancel(reserva.id_reserva);

    return {
      penalizacion,
      reembolso,
      mensaje: penalizacion === 0
        ? 'Cancelación sin cargo. Reembolso completo procesado.'
        : `Cancelación con penalización del ${Math.round((penalizacion / (reserva.precio_pagado || 1)) * 100)}%.`,
    };
  }
}

// ── UC-004: Check-in Digital ──────────────────────────────────────────────────
export class CheckinUseCase {
  constructor(
    private bookings: IBookingRepository,
    private passengers: IPassengerRepository
  ) {}

  async execute(codigoReserva: string, idPasajero: number): Promise<{
    eligible: boolean; razon?: string; paseAbordaje?: any;
  }> {
    const reserva = await this.bookings.findByCode(codigoReserva);
    if (!reserva || reserva.id_pasajero !== idPasajero) {
      throw new DomainError('Reserva no encontrada.', 'NOT_FOUND', 404);
    }
    if (reserva.checkin_realizado) {
      throw new DomainError('El check-in ya fue realizado.', 'ALREADY_CHECKED_IN', 409);
    }
    if (reserva.estado_reserva === 'CANCELADA') {
      return { eligible: false, razon: 'La reserva está cancelada.' };
    }

    // Time window: 24h before – 45min before flight
    // (Simplified: always eligible in demo mode)

    await this.bookings.updateCheckin(reserva.id_reserva);

    const paseAbordaje = {
      numero_pase: `PA-${reserva.codigo_reserva}-${Date.now().toString().slice(-4)}`,
      qr_code: `QR:${reserva.codigo_reserva}`,
      numero_asiento: reserva.numero_asiento,
      grupo_embarque: 'A',
      hora_embarque: '08:30',
    };

    return { eligible: true, paseAbordaje };
  }
}

// ── UC-005: Process Payment ───────────────────────────────────────────────────
export class ProcessPaymentUseCase {
  constructor(
    private payments: IPaymentRepository,
    private bookings: IBookingRepository
  ) {}

  async execute(input: PaymentInput): Promise<any> {
    // Validate reservation exists
    const reserva = await this.bookings.findById(input.idReserva);
    if (!reserva) {
      throw new DomainError('Reserva no encontrada.', 'NOT_FOUND', 404);
    }
    if (reserva.estado_reserva === 'CANCELADA') {
      throw new DomainError('No se puede pagar una reserva cancelada.', 'CANCELLED', 409);
    }

    // Validate amount
    if (input.monto <= 0) {
      throw new DomainError('El monto del pago debe ser mayor a 0.', 'INVALID_AMOUNT');
    }

    const result = await this.payments.process(input);
    return result;
  }
}

// ── UC-006: Get Personalized Recommendations ─────────────────────────────────
export class GetRecommendationsUseCase {
  constructor(
    private flights: IFlightRepository,
    private bookings: IBookingRepository,
    private loyalty: ILoyaltyRepository
  ) {}

  async execute(idPasajero: number): Promise<{
    vuelosRecomendados: any[];
    upgradeSugerido: boolean;
    mensajePersonalizado: string;
  }> {
    const [reservas, lealtad] = await Promise.all([
      this.bookings.findByPassenger(idPasajero),
      this.loyalty.findByPassenger(idPasajero),
    ]);

    // Top destination from history
    const destCount: Record<string, number> = {};
    reservas.forEach(r => {
      const d = r.aeropuerto_destino ?? '';
      if (d) destCount[d] = (destCount[d] ?? 0) + 1;
    });
    const topDest = Object.entries(destCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    const vuelos = topDest
      ? await this.flights.findAvailableByDestination(topDest)
      : await this.flights.findAll({ estado: 'PROGRAMADO' });

    const nivel = (lealtad as any)?.nivel_membresia ?? 'BRONCE';
    const upgradeSugerido = nivel === 'ORO' || nivel === 'PLATINO';

    const mensajes: Record<string, string> = {
      BRONCE:  '¡Empieza a acumular puntos y desbloquea beneficios exclusivos!',
      PLATA:   'Estás creciendo. Solo te faltan pocos puntos para el nivel Oro.',
      ORO:     'Como miembro Oro, tienes upgrades disponibles en tu próximo vuelo.',
      PLATINO: 'Bienvenido, miembro Platino. Disfruta de beneficios exclusivos.',
    };

    return {
      vuelosRecomendados: vuelos.slice(0, 5),
      upgradeSugerido,
      mensajePersonalizado: mensajes[nivel] ?? mensajes.BRONCE,
    };
  }
}

// ── UC-007: Handle Overbooking ────────────────────────────────────────────────
export class OverbookingUseCase {
  constructor(
    private flights: IFlightRepository,
    private bookings: IBookingRepository
  ) {}

  async execute(idVuelo: number): Promise<{
    pasajerosAfectados: number;
    accion: string;
    alternativas: any[];
  }> {
    const avail = await this.flights.getAvailability(idVuelo);
    const overflow = Math.abs(Math.min(avail.plazas_vacias, 0));

    if (overflow === 0) {
      return { pasajerosAfectados: 0, accion: 'NINGUNA', alternativas: [] };
    }

    // Find next available flight to same destination
    const flight = await this.flights.findById(idVuelo);
    const alternativas = flight?.aeropuerto_destino
      ? await this.flights.findAvailableByDestination(flight.aeropuerto_destino)
      : [];

    // Auto-reassign: upgrade passengers with highest loyalty to business class
    // (In production: call stored procedure SP_REASIGNAR_PASAJERO)
    const accion = alternativas.length > 0
      ? `${overflow} pasajero(s) reasignado(s) a vuelo alternativo con upgrade cortesía.`
      : `Sin alternativas disponibles. Se emite compensación de Q500 por pasajero.`;

    return { pasajerosAfectados: overflow, accion, alternativas: alternativas.slice(0, 3) };
  }
}
