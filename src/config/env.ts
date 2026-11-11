export const env = {
  devMeterId: Number(import.meta.env.VITE_DEV_METER_ID ?? 1),
  currency: String(import.meta.env.VITE_CURRENCY ?? 'COP'),
} as const
