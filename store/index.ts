/**
 * Zustand Global Store — Estado global completo
 * Maneja: booking flow, search, cart, notifications badge, user preferences
 */
import { create } from 'zustand';

export type ClaseServicio = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
export type PaymentMethod = 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO' | 'PUNTOS';

export interface FlightSearchState {
  origen:       string;
  destino:      string;
  fecha:        string;
  pasajeros:    number;
  clase:        ClaseServicio;
  soloDirectos: boolean;
  precioMax:    number;
}

export interface BookingCartState {
  flightId:    number | null;
  asiento:     string | null;
  clase:       ClaseServicio;
  basePrice:   number;
  extrasTotal: number;
  discount:    number;
  iva:         number;
  total:       number;
  puntosGanados: number;
  promoCode:   string | null;
  metodo:      PaymentMethod;
}

interface AppState {
  // Search
  search: FlightSearchState;
  setSearch: (s: Partial<FlightSearchState>) => void;
  resetSearch: () => void;

  // Booking cart
  cart: BookingCartState;
  setCart: (c: Partial<BookingCartState>) => void;
  resetCart: () => void;

  // UI state
  notifBadge:    number;
  setNotifBadge: (n: number) => void;
  incNotifBadge: () => void;

  // Last search results (cached)
  lastFlightResults: any[];
  setLastFlightResults: (r: any[]) => void;
}

const DEFAULT_SEARCH: FlightSearchState = {
  origen: 'GUA', destino: '', fecha: new Date().toISOString().split('T')[0],
  pasajeros: 1, clase: 'ECONOMICA', soloDirectos: false, precioMax: 9999,
};

const DEFAULT_CART: BookingCartState = {
  flightId: null, asiento: null, clase: 'ECONOMICA',
  basePrice: 0, extrasTotal: 0, discount: 0, iva: 0, total: 0,
  puntosGanados: 0, promoCode: null, metodo: 'TARJETA',
};

export const useAppStore = create<AppState>((set) => ({
  search:       DEFAULT_SEARCH,
  setSearch:    (s) => set(st => ({ search: { ...st.search, ...s } })),
  resetSearch:  () => set({ search: DEFAULT_SEARCH }),

  cart:         DEFAULT_CART,
  setCart:      (c) => set(st => ({ cart: { ...st.cart, ...c } })),
  resetCart:    () => set({ cart: DEFAULT_CART }),

  notifBadge:    0,
  setNotifBadge: (n) => set({ notifBadge: n }),
  incNotifBadge: () => set(st => ({ notifBadge: st.notifBadge + 1 })),

  lastFlightResults: [],
  setLastFlightResults: (r) => set({ lastFlightResults: r }),
}));
