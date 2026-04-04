/**
 * Global error handler for API calls.
 * Normalizes all error shapes into a consistent ApiError.
 */
export interface ApiError {
  status: number;
  message: string;
  isOffline: boolean;
  isPermissionDenied: boolean;
  isConflict: boolean;
  raw?: unknown;
}

export function normalizeError(err: unknown): ApiError {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    return {
      status: (e.status as number) ?? 0,
      message: (e.message as string) ?? 'Error inesperado.',
      isOffline: e.isOffline === true || e.status === 0,
      isPermissionDenied: e.status === 403,
      isConflict: e.status === 409,
      raw: err,
    };
  }
  return { status: 0, message: String(err), isOffline: false, isPermissionDenied: false, isConflict: false };
}

export function getErrorMessage(err: unknown): string {
  return normalizeError(err).message;
}
