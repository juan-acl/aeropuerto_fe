/**
 * API Service — Axios layer for Oracle backend integration
 * Swap BASE_URL and call real endpoints once backend is ready.
 * All calls go through the interceptor that injects JWT automatically.
 */
import { Alert } from 'react-native';

/**
 * BASE_URL points to the ASP.NET Core 8 backend.
 * Set EXPO_PUBLIC_BE_URL in .env to override.
 * http profile: http://localhost:5087
 * https profile: https://localhost:7114
 */
const BASE_URL = process.env.EXPO_PUBLIC_BE_URL ?? 'http://localhost:5087/api';

// Simple fetch-based client (no axios dep needed, works on all platforms)
class ApiClient {
  private token: string | null = null;

  setToken(t: string | null) { this.token = t; }

  private headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: this.headers(),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      return res.json();
    } catch (e: any) {
      // In demo mode (no backend), silently return mock data
      if (e.message?.includes('fetch')) {
        console.warn(`[API] Backend unreachable — using mock data for ${path}`);
        throw new Error('OFFLINE');
      }
      Alert.alert('Error de red', e.message);
      throw e;
    }
  }

  get  = <T>(path: string)              => this.req<T>('GET',    path);
  post = <T>(path: string, body: unknown) => this.req<T>('POST',   path, body);
  put  = <T>(path: string, body: unknown) => this.req<T>('PUT',    path, body);
  del  = <T>(path: string)              => this.req<T>('DELETE', path);
}

export const api = new ApiClient();

// ─── Auth endpoints ────────────────────────────────────────────────────────
export const authService = {
  login:    (usuario: string, password: string) =>
    api.post<{ token: string; usuario: any }>('/auth/login', { usuario, password }),
  register: (data: any) =>
    api.post<{ token: string; usuario: any }>('/auth/registro', data),
  me:       () => api.get<any>('/auth/me'),
  logout:   () => api.post('/auth/logout', {}),
};

// ─── Vuelos endpoints ──────────────────────────────────────────────────────
export const vuelosService = {
  buscar: (origen: string, destino: string, fecha: string) =>
    api.get(`/vuelos/disponibles?origen=${origen}&destino=${destino}&fecha=${fecha}`),
  detalle: (id: number) => api.get(`/vuelos/${id}`),
  asientos: (id: number) => api.get(`/vuelos/${id}/asientos`),
  listar:  (params?: string) => api.get(`/vuelos${params ?? ''}`),
};

// ─── Reservas endpoints ────────────────────────────────────────────────────
export const reservasService = {
  crear:    (data: any) => api.post('/reservas', data),
  listar:   (idPasajero: number) => api.get(`/reservas?id_pasajero=${idPasajero}`),
  detalle:  (id: number) => api.get(`/reservas/${id}`),
  cancelar: (id: number) => api.del(`/reservas/${id}`),
  pagar:    (id: number, pago: any) => api.post(`/reservas/${id}/pago`, pago),
};

// ─── Check-in endpoints ────────────────────────────────────────────────────
export const checkinService = {
  realizar:  (data: any) => api.post('/checkin', data),
  verificar: (codigo: string) => api.get(`/checkin/${codigo}`),
};

// ─── Pasajeros endpoints ───────────────────────────────────────────────────
export const pasajerosService = {
  perfil:   (id: number) => api.get(`/pasajeros/${id}`),
  historial: (id: number) => api.get(`/pasajeros/${id}/historial`),
  actualizar: (id: number, data: any) => api.put(`/pasajeros/${id}`, data),
};
