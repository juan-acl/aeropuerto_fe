/**
 * Axios-compatible HTTP client for Oracle REST backend.
 * Uses fetch under the hood (no extra dependency, works on all Expo platforms).
 * Interceptors: JWT injection, Oracle error parsing, audit logging.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Oracle error codes we handle specifically
const ORACLE_ERRORS: Record<string, string> = {
  'ORA-00001': 'Registro duplicado. El valor ya existe en el sistema.',
  'ORA-02291': 'Referencia inválida. El registro relacionado no existe.',
  'ORA-02292': 'No se puede eliminar: existen registros relacionados.',
  'ORA-01400': 'Valor requerido no proporcionado.',
  'ORA-12899': 'Valor demasiado largo para el campo.',
  'ORA-20001': 'Pasajero con prohibición activa de vuelo.',
  'ORA-20002': 'Asiento ya ocupado.',
  'ORA-20003': 'Vuelo sin disponibilidad.',
  'ORA-20004': 'Plazo de check-in vencido.',
};

function parseOracleError(errorData: Record<string, unknown>): string {
  if (typeof errorData.oracle_error === 'string') {
    const code = errorData.oracle_error.split(':')[0];
    return ORACLE_ERRORS[code] ?? errorData.message as string ?? 'Error del servidor.';
  }
  return (errorData.message as string) ?? 'Error desconocido.';
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onUnauthorized?: () => void;
  private auditLog?: (event: string, details: Record<string, unknown>) => void;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) { this.token = token; }
  setOnUnauthorized(cb: () => void) { this.onUnauthorized = cb; }
  setAuditLogger(fn: (event: string, details: Record<string, unknown>) => void) {
    this.auditLog = fn;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extra,
    };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    const url = `${this.baseURL}${path}`;
    if (!params || Object.keys(params).length === 0) return url;
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return `${url}?${qs}`;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(path, config?.params);
    const headers = this.buildHeaders(config?.headers);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      // Network error — backend unreachable
      throw { status: 0, message: 'OFFLINE', isOffline: true };
    }

    const contentType = res.headers.get('content-type') ?? '';
    const responseData = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      // Handle Oracle-specific errors
      const errMsg = typeof responseData === 'object'
        ? parseOracleError(responseData as Record<string, unknown>)
        : String(responseData);

      if (res.status === 401) {
        this.auditLog?.('SESSION_EXPIRE', { path, status: 401 });
        this.onUnauthorized?.();
      }

      if (res.status === 403) {
        this.auditLog?.('PERMISO_DENEGADO', { path, status: 403 });
      }

      throw { status: res.status, message: errMsg, data: responseData };
    }

    return {
      data: responseData as T,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
    };
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>('GET', path, undefined, config);
  }
  post<T>(path: string, body: unknown, config?: RequestConfig) {
    return this.request<T>('POST', path, body, config);
  }
  put<T>(path: string, body: unknown, config?: RequestConfig) {
    return this.request<T>('PUT', path, body, config);
  }
  patch<T>(path: string, body: unknown, config?: RequestConfig) {
    return this.request<T>('PATCH', path, body, config);
  }
  delete<T>(path: string, config?: RequestConfig) {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) ?? 'http://localhost:5087/api';
export const axiosInstance = new ApiClient(BASE_URL);
export default axiosInstance;
