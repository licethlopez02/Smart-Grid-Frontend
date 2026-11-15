export const env = {
  currency: String(import.meta.env.VITE_CURRENCY ?? 'COP'),
} as const
