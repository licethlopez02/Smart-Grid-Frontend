import type { EstadoFactura, FacturaResponse } from '../api/dto'

const invoice = (
  id: number,
  start: string,
  end: string,
  kwh: number,
  tariff: number,
  estado: EstadoFactura,
  due: string,
): FacturaResponse => ({
  id,
  medidorId: 1,
  periodoInicio: start,
  periodoFin: end,
  montoTotal: Math.round(kwh * tariff),
  estado,
  consumoAcumuladoKwh: kwh,
  tarifaValor: tariff,
  tarifaVigenciaDesde: '2026-01-01',
  tarifaVigenciaHasta: '2026-12-31',
  fechaGeneracion: start,
  fechaVencimiento: due,
  fechaPago: estado === 'PAGADA' ? due : null,
  anomaliasNoResueltas: [],
})

export const invoicesMock: FacturaResponse[] = [
  invoice(5, '2026-09-01', '2026-09-30', 176.4, 650, 'PENDIENTE', '2026-10-30'),
  invoice(4, '2026-08-01', '2026-08-31', 188.4, 650, 'PAGADA', '2026-09-30'),
  invoice(3, '2026-07-01', '2026-07-31', 162, 650, 'VENCIDA', '2026-08-30'),
  invoice(2, '2026-06-01', '2026-06-30', 171, 620, 'PAGADA', '2026-07-30'),
  invoice(1, '2026-05-01', '2026-05-31', 158, 620, 'PAGADA', '2026-06-30'),
]
