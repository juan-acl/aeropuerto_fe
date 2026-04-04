export const v = {
  email:    (s: string) => /\S+@\S+\.\S+/.test(s),
  required: (s: string) => s.trim().length > 0,
  minLen:   (s: string, n: number) => s.length >= n,
  dpi:      (s: string) => /^\d{13}$/.test(s.replace(/\s/g, '')),
  pasaporte:(s: string) => s.trim().length >= 6,
};
