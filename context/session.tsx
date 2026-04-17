/**
 * Global session context — single source of truth for auth state.
 * logout() uses a key-reset pattern so Expo Router fully remounts the tab tree,
 * guaranteeing tabs, cached screens and navigation state are all cleared.
 */
import React, {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode, useRef,
} from 'react';
import { axiosInstance } from '../src/core/infrastructure/api/axiosInstance';
import { storeToken, getToken, clearToken } from '../src/core/infrastructure/api/authInterceptor';
import { RolUsuario, ROL_META, PERMISOS_POR_ROL, Permisos } from '../src/core/shared/constants';

export type { RolUsuario };
export { ROL_META, PERMISOS_POR_ROL };

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  jerarquia?: number; // <-- Nuevo anclaje robusto a DB
  departamento?: string;
  avatar: string;
  token?: string;
}

interface SesionCtx {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  /** Tries backend, falls back to demo accounts */
  login: (usr: string, pass: string) => Promise<boolean>;
  /** Direct demo login by username */
  loginDemo: (usr: string) => void;
  /** Clears all state + storage + triggers full remount via sessionKey */
  logout: () => void;
  /** Increments every time logout is called — used as React key to remount */
  sessionKey: number;
  permisos: Permisos;
  puede: (key: keyof Permisos) => boolean;
  esCliente: boolean;
  esPersonal: boolean;
  esAdmin: boolean;
  esSoloLectura: boolean;
  misReservas: any[];
  agregarReserva: (r: any) => void;
  registrarEvento: (evento: string, detalles?: Record<string, unknown>) => void;
}

const defaultCtx: SesionCtx = {
  usuario: null, token: null, loading: false, initialized: false,
  login: async () => false, loginDemo: () => {}, logout: () => {},
  sessionKey: 0,
  permisos: PERMISOS_POR_ROL['CLIENTE'], puede: () => false,
  esCliente: true, esPersonal: false, esAdmin: false, esSoloLectura: true,
  misReservas: [], agregarReserva: () => {},
  registrarEvento: () => {},
};

const Ctx = createContext<SesionCtx>(defaultCtx);

// ── Demo accounts (password: 1234 for all) ───────────────────────────────────
export const DEMO_ACCOUNTS: Array<{ usuario: string; pass: string; datos: Usuario }> = [
  { usuario: 'cliente',      pass: '1234', datos: { id: 100, nombre: 'Andrea',      apellido: 'Morales',   email: 'a.morales@gmail.com',     rol: 'CLIENTE',          avatar: '🧳' } },
  { usuario: 'recepcion',    pass: '1234', datos: { id: 2,   nombre: 'Carlos',      apellido: 'Méndez',    email: 'c.mendez@aurora.aero',    rol: 'RECEPCIONISTA',    avatar: '🎫', departamento: 'Recepción' } },
  { usuario: 'checkin',      pass: '1234', datos: { id: 3,   nombre: 'Ana',         apellido: 'Hernández', email: 'a.hernandez@aurora.aero',  rol: 'CHECKIN',          avatar: '', departamento: 'Check-in' } },
  { usuario: 'operaciones',  pass: '1234', datos: { id: 4,   nombre: 'Roberto',     apellido: 'Pérez',     email: 'r.perez@aurora.aero',     rol: 'OPERACIONES',      avatar: '', departamento: 'Operaciones' } },
  { usuario: 'seguridad',    pass: '1234', datos: { id: 5,   nombre: 'María',       apellido: 'López',     email: 'm.lopez@aurora.aero',     rol: 'SEGURIDAD',        avatar: '🛡️', departamento: 'Seguridad' } },
  { usuario: 'supervisor',   pass: '1234', datos: { id: 6,   nombre: 'Sofía',       apellido: 'Ramírez',   email: 's.ramirez@aurora.aero',   rol: 'SUPERVISOR',       avatar: '', departamento: 'Supervisión' } },
  { usuario: 'jefe',         pass: '1234', datos: { id: 7,   nombre: 'Diego',       apellido: 'Torres',    email: 'd.torres@aurora.aero',    rol: 'JEFE_OPERACIONES', avatar: '', departamento: 'Control Aéreo' } },
  { usuario: 'finanzas',     pass: '1234', datos: { id: 8,   nombre: 'Luis',        apellido: 'González',  email: 'l.gonzalez@aurora.aero',  rol: 'FINANZAS',         avatar: '', departamento: 'Finanzas' } },
  { usuario: 'rrhh',         pass: '1234', datos: { id: 9,   nombre: 'Patricia',    apellido: 'Vidal',     email: 'p.vidal@aurora.aero',     rol: 'RRHH',             avatar: '👥', departamento: 'RRHH' } },
  { usuario: 'mantenimiento',pass: '1234', datos: { id: 10,  nombre: 'Jorge',       apellido: 'Castillo',  email: 'j.castillo@aurora.aero',  rol: 'MANTENIMIENTO',    avatar: '', departamento: 'Mantenimiento' } },
  { usuario: 'admin',        pass: '1234', datos: { id: 1,   nombre: 'Admin',       apellido: 'General',   email: 'admin@aurora.aero',       rol: 'ADMIN',            avatar: '', departamento: 'TI' } },
];

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario]       = useState<Usuario | null>(null);
  const [token, setToken]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [misReservas, setMisReservas] = useState<any[]>([]);
  // This key increments on every logout — consumers use it as a React key
  // to force a full unmount/remount of the navigation tree
  const [sessionKey, setSessionKey] = useState(0);

  // ── Restore persisted session on first mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const saved = await getToken();
        if (saved) {
          const match = saved.match(/^demo-(\d+)-/);
          if (match) {
            const id = Number(match[1]);
            const account = DEMO_ACCOUNTS.find(a => a.datos.id === id);
            if (account) {
              setToken(saved);
              axiosInstance.setToken(saved);
              setUsuario({ ...account.datos, token: saved });
            }
          }
        }
      } catch { /* ignore */ }
      setInitialized(true);
    })();
  }, []); // runs once on mount only

  useEffect(() => {
    axiosInstance.setToken(token);
  }, [token]);

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (usr: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Validar estrictamente contra backend Oracle
      try {
        const res = await axiosInstance.post<{ token: string; usuario: Usuario }>(
          '/auth/login', { usuario: usr, password: pass }
        );
        const { token: t, usuario: u } = res.data;
        await storeToken(t);
        setToken(t);
        setUsuario({ ...u, token: t });
        return true;
      } catch (error) {
        console.warn("Fallo de authenticación BD:", error);
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── loginDemo ────────────────────────────────────────────────────────────
  const loginDemo = useCallback((usr: string) => {
    const found = DEMO_ACCOUNTS.find(a => a.usuario === usr.toLowerCase());
    if (!found) return;
    const fakeToken = `demo-${found.datos.id}-${Date.now()}`;
    storeToken(fakeToken);           // fire-and-forget
    setToken(fakeToken);
    setUsuario({ ...found.datos, token: fakeToken });
  }, []);

  // ── logout ───────────────────────────────────────────────────────────────
  // Synchronous + triggers sessionKey bump so _layout can reset navigation.
  const logout = useCallback(() => {
    // Clear storage async (fire-and-forget — don't block UI)
    clearToken().catch(() => {});
    // Wipe all in-memory state immediately
    setToken(null);
    setUsuario(null);
    setMisReservas([]);
    // Bump key → forces consumers using this as <X key={sessionKey}> to remount
    setSessionKey(k => k + 1);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const permisos = PERMISOS_POR_ROL[usuario?.rol ?? 'CLIENTE'];

  const puede = useCallback((key: keyof Permisos): boolean => {
    const val = permisos[key];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val !== 'ninguno';
    return false;
  }, [permisos]);

  const agregarReserva = useCallback((r: any) => {
    setMisReservas(prev => [r, ...prev]);
  }, []);

  const registrarEvento = useCallback(
    (evento: string, detalles?: Record<string, unknown>) => {
      axiosInstance.post('/audit/log', {
        usuario: usuario?.id, evento,
        timestamp: new Date().toISOString(), ...detalles,
      }).catch(() => {});
    },
    [usuario]
  );

  return (
    <Ctx.Provider value={{
      usuario, token, loading, initialized,
      login, loginDemo, logout, sessionKey,
      permisos, puede,
      esCliente:  !usuario || (usuario.jerarquia !== undefined ? usuario.jerarquia >= 4 : usuario.rol === 'CLIENTE'),
      esPersonal: !!usuario && (usuario.jerarquia !== undefined ? usuario.jerarquia <= 3 : usuario.rol !== 'CLIENTE' && usuario.rol !== 'ADMIN'),
      esAdmin:    usuario?.jerarquia === 1 || usuario?.rol?.toUpperCase().includes('ADMIN'),
      esSoloLectura: usuario?.jerarquia !== undefined ? usuario.jerarquia >= 3 : (!usuario?.rol?.toUpperCase().includes('ADMIN')),
      misReservas, agregarReserva, registrarEvento,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSesion = () => useContext(Ctx);
