const isTrue = (value: string | undefined) => value === 'true'

export const env = {
  useMocks: {
    invoices: isTrue(import.meta.env.VITE_USE_MOCKS_INVOICES),
    consumption: isTrue(import.meta.env.VITE_USE_MOCKS_CONSUMPTION),
  },
  devMeterId: Number(import.meta.env.VITE_DEV_METER_ID ?? 1),
  currency: String(import.meta.env.VITE_CURRENCY ?? 'COP'),
} as const
