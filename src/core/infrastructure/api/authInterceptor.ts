/**
 * Auth interceptor utilities — manages JWT lifecycle.
 * Uses expo-secure-store for token persistence (falls back to memory in web).
 */
import axiosInstance from './axiosInstance';

let memoryToken: string | null = null;

export async function storeToken(token: string): Promise<void> {
  memoryToken = token;
  try {
    // Dynamic import so web doesn't crash (expo-secure-store is native-only)
    // @ts-ignore
    const { setItemAsync } = await import('expo-secure-store');
    await setItemAsync('aurora_jwt', token);
  } catch {
    // Web fallback: keep in memory only (never localStorage for security)
    console.warn('[Auth] SecureStore unavailable, token kept in memory only');
  }
}

export async function getToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  try {
    // @ts-ignore
    const { getItemAsync } = await import('expo-secure-store');
    const t = await getItemAsync('aurora_jwt');
    memoryToken = t;
    return t;
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  axiosInstance.setToken(null);
  try {
    // @ts-ignore
    const { deleteItemAsync } = await import('expo-secure-store');
    await deleteItemAsync('aurora_jwt');
  } catch {}
}

export async function initAuth(): Promise<string | null> {
  const token = await getToken();
  if (token) axiosInstance.setToken(token);
  return token;
}
