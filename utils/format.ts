export const fmt = {
  moneda: (n: number, moneda = 'USD') =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: moneda }).format(n),
  fecha: (iso: string) =>
    new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }),
  hora: (iso: string) => iso?.includes('T') ? iso.split('T')[1]?.slice(0, 5) : iso?.slice(0, 5) ?? '--:--',
  duracion: (min: number) => `${Math.floor(min/60)}h ${min%60}m`,
};
