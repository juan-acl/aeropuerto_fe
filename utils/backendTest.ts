/**
 * backendTest.ts — Manual integration test helper
 * Run in browser console or as a script to verify backend connectivity
 *
 * Usage (in a component or hook):
 *   import { runBackendTests } from '@/utils/backendTest';
 *   runBackendTests().then(console.log);
 */
import { backendApi } from '@/services/backendApi';

export async function runBackendTests() {
  const results: Record<string, { ok: boolean; data?: unknown; error?: string }> = {};

  const test = async (name: string, fn: () => Promise<unknown>) => {
    try {
      const data = await fn();
      results[name] = { ok: true, data };
      console.log(`✅ ${name}:`, data);
    } catch (err: any) {
      results[name] = { ok: false, error: err.message };
      console.warn(`❌ ${name}:`, err.message);
    }
  };

  console.group('🔌 Backend Integration Tests');

  await test('Health check',        () => backendApi.health());
  await test('List aeropuertos',    () => backendApi.aeropuertos.listar());
  await test('List aerolineas',     () => backendApi.aerolineas.listar());
  await test('List tripulacion',    () => backendApi.tripulacion.listar());
  await test('List temporadas',     () => backendApi.temporadas.listar());

  console.groupEnd();

  const passed = Object.values(results).filter(r => r.ok).length;
  const total  = Object.keys(results).length;
  console.log(`\nResults: ${passed}/${total} passed`);

  return results;
}
