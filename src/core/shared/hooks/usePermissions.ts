/**
 * RBAC hooks — query role permissions cleanly.
 * Based on roles_permisos_modulos (mod 24) logic.
 */
import { useCallback } from 'react';
import { PERMISOS_POR_ROL, RolUsuario, Permisos } from '../constants';

// This hook is used at the component level to check permissions
export function usePermissions(rol: RolUsuario | null | undefined) {
  const permisos: Permisos = PERMISOS_POR_ROL[rol ?? 'CLIENTE'];

  const puede = useCallback(
    (permiso: keyof Permisos): boolean => {
      const val = permisos[permiso];
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val !== 'ninguno';
      return false;
    },
    [permisos]
  );

  const tieneModulo = useCallback(
    (numModulo: number): boolean => permisos.modulosOperativos.includes(numModulo),
    [permisos]
  );

  const puedeVerPasajero = useCallback(
    (esPropioId: boolean): boolean => {
      if (permisos.verPasajeros === 'completo') return true;
      if (permisos.verPasajeros === 'limitado') return true;
      if (permisos.verPasajeros === 'propio') return esPropioId;
      return false;
    },
    [permisos]
  );

  return { permisos, puede, tieneModulo, puedeVerPasajero };
}
